import type { H3Event } from 'h3'
import { betterAuth } from 'better-auth'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP, oAuthProxy } from 'better-auth/plugins'

type OAuthProvider = 'github' | 'google'

/**
 * This deployment's public URL. Set `BETTER_AUTH_URL` when self-hosting. On Vercel it falls back to the
 * production domain or the preview's own URL. Left undefined (inferred per request) in local dev and tests.
 */
function resolveBaseURL(): string | undefined {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL
  if (process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_ENV === 'preview' && (process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL))
    return `https://${process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL}`
}

function createServerAuth() {
  const config = useRuntimeConfig()
  const baseURL = resolveBaseURL()
  // Previews send OAuth through production, so only production's callback is registered with GitHub and Google.
  const oauthProxyURL = process.env.OAUTH_PROXY_URL
  const oauthProxySecret = process.env.OAUTH_PROXY_SECRET
  const oauthOrigin = oauthProxyURL || baseURL
  // Keep the callback URLs OAuth apps already have registered: `/auth/github` and `/auth/google`.
  const redirectURI = (provider: OAuthProvider) => oauthOrigin ? `${oauthOrigin}/auth/${provider}` : undefined
  /**
   * The origin of links in emails: `NUXT_PUBLIC_APP_URL`, else this deployment's URL. Like `getAppOrigin`,
   * the origin Better Auth inferred from the request is only trusted on Vercel and in development.
   */
  const linkOrigin = (inferredURL: string | undefined) => {
    const url = config.public.appUrl || baseURL || ((process.env.VERCEL || import.meta.dev) ? inferredURL : undefined)
    if (url) return new URL(url).origin
    const message = 'NUXT_PUBLIC_APP_URL is not set. Set it to the URL Shelve is served from, for example https://shelve.example.com.'
    console.error(`[shelve] ${message}`)
    throw createError({ statusCode: 500, statusMessage: message })
  }
  const adminEmails = config.private.adminEmails?.split(',').map((e: string) => e.trim()).filter(Boolean) ?? []

  const trustedOrigins = [
    baseURL,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
    process.env.VERCEL_BRANCH_URL && `https://${process.env.VERCEL_BRANCH_URL}`,
    ...(config.private.allowedOrigins?.split(',').map((o: string) => o.trim()) ?? []),
  ].filter((origin): origin is string => !!origin)

  const socialProviders: Record<string, object> = {}
  if (config.oauth.github.clientId) {
    socialProviders.github = {
      clientId: config.oauth.github.clientId,
      clientSecret: config.oauth.github.clientSecret,
      redirectURI: redirectURI('github'),
      // `repo` lets Shelve list the user's repositories and push secrets as them.
      scope: ['repo'],
      mapProfileToUser: (profile: { login: string }) => ({ name: profile.login }),
    }
  }
  if (config.oauth.google.clientId) {
    socialProviders.google = {
      clientId: config.oauth.google.clientId,
      clientSecret: config.oauth.google.clientSecret,
      redirectURI: redirectURI('google'),
      mapProfileToUser: (profile: { given_name?: string; family_name?: string }) => ({
        name: [profile.given_name, profile.family_name].filter(Boolean).join('_'),
      }),
    }
  }

  return betterAuth({
    baseURL,
    secret: config.appSecret,
    trustedOrigins,
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        users: schema.users,
        accounts: schema.accounts,
        sessions: schema.sessions,
        verifications: schema.verifications,
      },
    }),
    advanced: {
      // Shelve's tables use bigint identity columns. Better Auth reads their IDs back as strings.
      database: { generateId: 'serial' },
    },
    user: {
      modelName: 'users',
      fields: { name: 'username', image: 'avatar' },
      additionalFields: {
        role: { type: 'string', required: false, input: false },
        authType: { type: 'string', required: false, input: false },
        onboarding: { type: 'boolean', required: false, input: false },
        cliInstalled: { type: 'boolean', required: false, input: false },
      },
    },
    account: {
      modelName: 'accounts',
      fields: { providerId: 'provider', accountId: 'providerAccountId' },
      // GitHub tokens can act on the user's repositories, so they are stored encrypted with the app secret.
      encryptOAuthTokens: true,
      // A GitHub or Google login joins an existing user with the same email when the provider verified that
      // email, as before. Existing users predate `emailVerified`, so their own flag isn't required.
      accountLinking: { enabled: true, requireLocalEmailVerified: false },
    },
    session: { modelName: 'sessions' },
    verification: { modelName: 'verifications' },
    socialProviders,
    // OAuth failures that happen before Better Auth reads the state, such as a forged or expired one.
    onAPIError: { errorURL: '/login' },
    databaseHooks: {
      user: {
        create: {
          before: async (user, ctx) => {
            // Creating a user and granting admin trust the email, so an OAuth email must be verified by the provider.
            if (!user.emailVerified) {
              throw new APIError('FORBIDDEN', { code: 'unverified-email', message: 'Your email is not verified with this provider' })
            }
            const provider = ctx?.params?.id
            const authType = provider === 'github' || provider === 'google' ? provider : 'email'
            const base = user.name || user.email.split('@')[0]!
            return {
              data: {
                ...user,
                name: await availableUsername(base),
                image: user.image || DEFAULT_AVATAR,
                role: adminEmails.includes(user.email) ? 'admin' : 'user',
                authType,
                onboarding: false,
                cliInstalled: false,
              },
            }
          },
          after: async (user, ctx) => {
            // A welcome email that can't be sent, or linked, must not fail the sign-up.
            try {
              await new EmailService().sendWelcomeEmail(user.email, user.name, linkOrigin(ctx?.context.baseURL))
            } catch (error) {
              console.error('[Auth] Welcome email not sent:', error)
            }
          },
        },
      },
      session: {
        create: {
          // `NUXT_PRIVATE_ADMIN_EMAILS` stays the source of truth for admins on every sign-in.
          before: async (session) => {
            await syncUserRole(Number(session.userId), adminEmails)
          },
        },
      },
    },
    hooks: {
      after: createAuthMiddleware((ctx) => {
        if (ctx.path === '/sign-out') ctx.setCookie('defaultTeamSlug', '', { maxAge: 0, path: '/' })
        return Promise.resolve()
      }),
    },
    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: 10 * 60,
        allowedAttempts: 5,
        storeOTP: 'hashed',
        async sendVerificationOTP({ email, otp }, ctx) {
          const link = `${linkOrigin(ctx?.context.baseURL)}/auth/otp?${new URLSearchParams({ email, otp })}`
          await new EmailService().sendOtp(email, otp, link)
        },
      }),
      ...(oauthProxyURL && oauthProxySecret
        ? [oAuthProxy({ productionURL: oauthProxyURL, currentURL: baseURL, secret: oauthProxySecret })]
        : []),
    ],
  })
}

let instance: ReturnType<typeof createServerAuth> | undefined

/** The Better Auth instance, created on first use because it reads the runtime config. */
export function useServerAuth() {
  instance ??= createServerAuth()
  return instance
}

/** Copies the `Set-Cookie` headers of a Better Auth response onto the h3 response. */
export function forwardAuthCookies(event: H3Event, headers: Headers | null | undefined) {
  for (const cookie of headers?.getSetCookie() ?? []) appendResponseHeader(event, 'set-cookie', cookie)
}

/**
 * `/auth/github` and `/auth/google` start a sign-in, and are also the callback URLs registered with
 * GitHub and Google. A request carrying `code`, `state` or `error` is the provider coming back, so it goes
 * to Better Auth's own callback.
 */
export async function handleOAuthRoute(event: H3Event, provider: OAuthProvider) {
  const query = getQuery(event)
  const auth = useServerAuth()

  if (query.code || query.state || query.error) {
    const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true })
    const callback = new URL(`/api/auth/callback/${provider}${url.search}`, url)
    return auth.handler(new Request(callback, { headers: event.headers }))
  }

  const defaultTeamSlug = getCookie(event, 'defaultTeamSlug')
  const redirect = getSafeRedirectPath(query.redirect)
  const response = await auth.api.signInSocial({
    body: {
      provider,
      callbackURL: redirect ?? (defaultTeamSlug ? `/${encodeURIComponent(defaultTeamSlug)}` : '/'),
      newUserCallbackURL: redirect ?? '/onboarding',
      // Better Auth appends `?error=<code>`, which the login page shows.
      errorCallbackURL: '/login',
      disableRedirect: true,
    },
    headers: event.headers,
    asResponse: true,
  })
  forwardAuthCookies(event, response.headers)
  const { url } = await response.json() as { url?: string }
  if (!response.ok || !url) return sendRedirect(event, `/login?error=${provider}`)
  return sendRedirect(event, url)
}
