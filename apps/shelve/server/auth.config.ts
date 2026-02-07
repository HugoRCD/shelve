import { defineServerAuth } from '@onmax/nuxt-better-auth/config'
import { admin, emailOTP } from 'better-auth/plugins'
import { AuthType, Role } from '../../../packages/types'
import { validateUsername } from './services/user'

const DEFAULT_AVATAR = 'https://i.imgur.com/6VBx3io.png'

function resolveAuthType(provider?: string): AuthType {
  if (provider === AuthType.GITHUB) return AuthType.GITHUB
  if (provider === AuthType.GOOGLE) return AuthType.GOOGLE
  return AuthType.EMAIL
}

function buildLoginOtpUrl(baseUrl: string, email: string, otp: string): string {
  const url = new URL('/login', baseUrl)
  url.searchParams.set('email', email)
  url.searchParams.set('otp', otp)
  return url.toString()
}

export default defineServerAuth(({ runtimeConfig, db }) => ({
  database: db,
  advanced: {
    database: {
      generateId: 'uuid',
    },
  },
  socialProviders: {
    github: {
      clientId: runtimeConfig.oauth?.github?.clientId || '',
      clientSecret: runtimeConfig.oauth?.github?.clientSecret || '',
      scope: ['repo', 'user:email'],
      mapProfileToUser: (profile) => ({
        name: profile.login,
      }),
    },
    google: {
      clientId: runtimeConfig.oauth?.google?.clientId || '',
      clientSecret: runtimeConfig.oauth?.google?.clientSecret || '',
      scope: ['profile', 'email'],
      mapProfileToUser: (profile) => ({
        name: profile.given_name && profile.family_name
          ? `${profile.given_name}_${profile.family_name}`
          : profile.name,
      }),
    },
  },
  plugins: [
    emailOTP({
      sendVerificationOTP: async ({ email, otp }, ctx) => {
        const { EmailService: emailServiceCtor } = await import('./services/resend')
        const baseUrl = ctx?.context?.baseURL || runtimeConfig.public?.siteUrl || ''
        const redirectUrl = buildLoginOtpUrl(baseUrl, email, otp)
        await new emailServiceCtor().sendOtp(email, otp, redirectUrl)
      },
    }),
    admin(),
  ],
  user: {
    additionalFields: {
      role: { type: 'string', required: true, defaultValue: Role.USER },
      authType: { type: 'string', required: true, defaultValue: AuthType.EMAIL },
      onboarding: { type: 'boolean', required: true, defaultValue: false },
      cliInstalled: { type: 'boolean', required: true, defaultValue: false },
      legacyId: { type: 'number', required: false, bigint: true, index: true, unique: true },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, context) => {
          const adminEmails = runtimeConfig.private?.adminEmails?.split(',').map((value) => value.trim()).filter(Boolean) || []
          const authType = resolveAuthType((context?.body as { provider?: string } | undefined)?.provider)
          const baseName = user.name?.trim() || user.email?.split('@')[0] || 'user'
          const name = await validateUsername(baseName, authType)

          return {
            data: {
              ...user,
              name,
              image: user.image || DEFAULT_AVATAR,
              role: adminEmails.includes(user.email) ? Role.ADMIN : Role.USER,
              authType,
            },
          }
        },
        after: async (user) => {
          const { EmailService: emailServiceCtor } = await import('./services/resend')
          const appUrl = runtimeConfig.public?.siteUrl || ''
          await new emailServiceCtor().sendWelcomeEmail(user.email, user.name || user.email, appUrl)
        },
      },
      update: {
        before: async (user, context) => {
          if (!user.name) return
          const authType = resolveAuthType((context?.body as { provider?: string } | undefined)?.provider)
          return {
            data: {
              ...user,
              name: await validateUsername(user.name, authType),
            },
          }
        },
      },
    },
  },
}))
