import type { H3Event } from 'h3'
import { betterAuth } from 'better-auth'
import { oAuthProxy } from 'better-auth/plugins'

type OAuthProvider = 'github' | 'google'

let proxy: ReturnType<typeof createProxy> | undefined

function createProxy(productionURL: string, secret: string) {
  const { oauth } = useRuntimeConfig()
  return betterAuth({
    baseURL: productionURL,
    secret,
    socialProviders: {
      github: { ...oauth.github, redirectURI: `${productionURL}/auth/github` },
      google: { ...oauth.google, redirectURI: `${productionURL}/auth/google` },
    },
    plugins: [oAuthProxy({ productionURL, secret })],
  })
}

function getProxy() {
  const productionURL = process.env.OAUTH_PROXY_URL
  const secret = process.env.OAUTH_PROXY_SECRET
  if (!productionURL || !secret) return
  proxy ??= createProxy(productionURL.replace(/\/+$/, ''), secret)
  return proxy
}

/** Only a Vercel preview's Better Auth completion endpoint may receive the encrypted profile. */
function isPreviewCompletionURL(location: string | null, provider: OAuthProvider): location is string {
  if (!location) return false
  const url = new URL(location)
  return url.protocol === 'https:'
    && url.hostname.endsWith('.vercel.app')
    && url.pathname === `/api/auth/callback/${provider}/oauth-proxy`
}

/**
 * Lets preview deployments sign in with GitHub and Google, whose only registered callback is production.
 * A preview running Better Auth's `oAuthProxy` plugin sends the provider here with a state encrypted
 * with `OAUTH_PROXY_SECRET`. This exchanges the code and hands the encrypted profile back to that preview,
 * without creating a user or session on production. Production's own logins (state matching the
 * `nuxt-auth-state` cookie) are left to nuxt-auth-utils. Returns `true` when it handled the request.
 */
export async function proxyPreviewOAuthCallback(event: H3Event, provider: OAuthProvider): Promise<boolean> {
  const { code, error, state } = getQuery(event)
  if (typeof state !== 'string' || (!code && !error)) return false
  if (state === getCookie(event, 'nuxt-auth-state')) return false

  const auth = getProxy()
  if (!auth) return false

  const url = new URL(`${auth.options.baseURL}/api/auth/callback/${provider}`)
  url.search = getRequestURL(event).search
  const response = await auth.handler(new Request(url))
  const location = response.headers.get('location')
  if (!isPreviewCompletionURL(location, provider)) {
    console.error(`OAuth proxy: refused ${provider} callback (status ${response.status})`)
    await sendRedirect(event, `/login?error=${provider}`)
    return true
  }
  await sendRedirect(event, location)
  return true
}
