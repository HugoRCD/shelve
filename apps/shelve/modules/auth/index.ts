import { defineNuxtModule } from 'nuxt/kit'
import { z } from 'zod'

// eslint-disable-next-line
function validateOAuthPair(
  data: Record<string, any>,
  ctx: any,
  clientIdKey: string,
  clientSecretKey: string,
  providerName: string,
) {
  const hasId = !!data[clientIdKey]
  const hasSecret = !!data[clientSecretKey]

  if (hasId !== hasSecret) {
    const missingKey = hasId ? clientSecretKey : clientIdKey
    const existingKey = hasId ? clientIdKey : clientSecretKey
    ctx.issues.push({
      code: 'custom',
      message: `${missingKey} is required when ${existingKey} is set for ${providerName} OAuth.`,
      path: [missingKey],
    })
  }
}

const commaSeparatedStringToArray = z.preprocess(
  (val) => {
    if (typeof val === 'string' && val.length > 0) {
      return val.split(',').map(s => s.trim())
    }
    return []
  },
  z.array(z.string()).optional(),
)

const requiredCoreSchema = z.object({
  DATABASE_URL: z.url().startsWith('postgres', { error: 'Must be a valid PostgreSQL URL.' }).optional(),
  BETTER_AUTH_SECRET: z.string().min(32, { error: 'Better Auth secret must be at least 32 characters long.' }).optional(),
  NUXT_BETTER_AUTH_SECRET: z.string().min(32, { error: 'Better Auth secret must be at least 32 characters long.' }).optional(),
  NUXT_PRIVATE_ENCRYPTION_KEY: z.string().min(32, { error: 'Encryption key must be at least 32 characters long.' }),
})

const authProvidersSchema = z.object({
  NUXT_OAUTH_GITHUB_CLIENT_ID: z.string().optional(),
  NUXT_OAUTH_GITHUB_CLIENT_SECRET: z.string().optional(),
  NUXT_OAUTH_GOOGLE_CLIENT_ID: z.string().optional(),
  NUXT_OAUTH_GOOGLE_CLIENT_SECRET: z.string().optional(),
  NUXT_PRIVATE_GITHUB_PRIVATE_KEY: z.string().optional(),
})

const emailSchema = z.object({
  NUXT_PRIVATE_RESEND_API_KEY: z.string().startsWith('re_', { error: 'Resend API key must start with "re_"' }).optional().or(z.literal('')),
  NUXT_PRIVATE_SENDER_EMAIL: z.email({ error: 'Sender email must be a valid email address.' }).optional().or(z.literal('')),
})

const adminAndSecuritySchema = z.object({
  NUXT_PRIVATE_ADMIN_EMAILS: commaSeparatedStringToArray.pipe(z.array(z.email({ error: 'One of the admin emails is invalid.' }))),
  NUXT_PRIVATE_ALLOWED_ORIGINS: commaSeparatedStringToArray.pipe(z.array(z.url({ error: 'One of the allowed origins is an invalid URL.' }))),
})

export const envSchema = z.object({
  ...requiredCoreSchema.shape,
  ...authProvidersSchema.shape,
  ...emailSchema.shape,
  ...adminAndSecuritySchema.shape,
}).superRefine((data, ctx) => {
  validateOAuthPair(data, ctx, 'NUXT_OAUTH_GITHUB_CLIENT_ID', 'NUXT_OAUTH_GITHUB_CLIENT_SECRET', 'GitHub')
  validateOAuthPair(data, ctx, 'NUXT_OAUTH_GOOGLE_CLIENT_ID', 'NUXT_OAUTH_GOOGLE_CLIENT_SECRET', 'Google')
  if (!data.BETTER_AUTH_SECRET && !data.NUXT_BETTER_AUTH_SECRET) {
    ctx.issues.push({
      code: 'custom',
      message: 'BETTER_AUTH_SECRET is required for Better Auth.',
      path: ['BETTER_AUTH_SECRET'],
    })
  }
})

function handleValidationError(error: z.ZodError) {
  console.error('❌ Environment variables validation failed:')

  for (const issue of error.issues) {
    const fieldPath = issue.path.length > 0 ? issue.path.join('.') : 'root'
    console.error(`  - ${fieldPath}: ${issue.message}`)
  }

  throw new Error('Invalid environment variables.')
}

export default defineNuxtModule({
  meta: {
    name: '@shelve/auth',
  },
  setup(options, nuxt) {
    try {
      // `nuxt prepare` runs during `postinstall`; don't block installs on missing runtime env.
      const isPrepare = !!(nuxt.options as any)._prepare || process.env.npm_lifecycle_event === 'postinstall'
      const skipValidation = process.env.SKIP_ENV_VALIDATION
      const isNonVercelCI = process.env.CI && !process.env.VERCEL
      if (isPrepare || isNonVercelCI || skipValidation) {
        console.log('Skipping environment variable validation (prepare/postinstall, CI, or SKIP_ENV_VALIDATION).')
        return
      }
      const env = envSchema.parse(process.env)

      const isGithubEnabled = !!(env.NUXT_OAUTH_GITHUB_CLIENT_ID && env.NUXT_OAUTH_GITHUB_CLIENT_SECRET)
      const isGoogleEnabled = !!(env.NUXT_OAUTH_GOOGLE_CLIENT_ID && env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET)
      const isEmailEnabled = !!env.NUXT_PRIVATE_RESEND_API_KEY || process.env.NUXT_ENABLE_EMAIL_AUTH === 'true'

      nuxt.options.appConfig.auth = {
        isGoogleEnabled,
        isGithubEnabled,
        isEmailEnabled
      }

      console.log('🔐 Auth configuration validated:')
      console.log(`  GitHub OAuth: ${isGithubEnabled ? '✅' : '❌'}`)
      console.log(`  Google OAuth: ${isGoogleEnabled ? '✅' : '❌'}`)
      console.log(`  Email Service: ${isEmailEnabled ? '✅' : '❌'}`)
    } catch (error) {
      if (error instanceof z.ZodError) {
        handleValidationError(error)
      }
      throw error
    }
  },
})
