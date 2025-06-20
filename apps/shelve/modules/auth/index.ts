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
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
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
  DATABASE_URL: z.string().url().startsWith('postgres', 'Must be a valid PostgreSQL URL.'),
  NUXT_SESSION_PASSWORD: z.string().min(32, 'Session password must be at least 32 characters long.'),
  NUXT_PRIVATE_ENCRYPTION_KEY: z.string().min(32, 'Encryption key must be at least 32 characters long.'),
})

const authProvidersSchema = z.object({
  NUXT_OAUTH_GITHUB_CLIENT_ID: z.string().optional(),
  NUXT_OAUTH_GITHUB_CLIENT_SECRET: z.string().optional(),
  NUXT_OAUTH_GOOGLE_CLIENT_ID: z.string().optional(),
  NUXT_OAUTH_GOOGLE_CLIENT_SECRET: z.string().optional(),
  NUXT_PRIVATE_GITHUB_PRIVATE_KEY: z.string().optional(),
})

const emailSchema = z.object({
  NUXT_PRIVATE_RESEND_API_KEY: z.string().startsWith('re_', 'Resend API key must start with "re_"').optional().or(z.literal('')),
  NUXT_PRIVATE_SENDER_EMAIL: z.string().email('Sender email must be a valid email address.').optional().or(z.literal('')),
})

const adminAndSecuritySchema = z.object({
  NUXT_PRIVATE_ADMIN_EMAILS: commaSeparatedStringToArray.pipe(z.array(z.string().email('One of the admin emails is invalid.'))),
  NUXT_PRIVATE_ALLOWED_ORIGINS: commaSeparatedStringToArray.pipe(z.array(z.string().url('One of the allowed origins is an invalid URL.'))),
})

export const envSchema = requiredCoreSchema
  .merge(authProvidersSchema)
  .merge(emailSchema)
  .merge(adminAndSecuritySchema)
  .superRefine((data, ctx) => {
    validateOAuthPair(data, ctx, 'NUXT_OAUTH_GITHUB_CLIENT_ID', 'NUXT_OAUTH_GITHUB_CLIENT_SECRET', 'GitHub')
    validateOAuthPair(data, ctx, 'NUXT_OAUTH_GOOGLE_CLIENT_ID', 'NUXT_OAUTH_GOOGLE_CLIENT_SECRET', 'Google')
  })

function handleValidationError(error: z.ZodError) {
  console.error('❌ Environment variables validation failed:')
  const { fieldErrors } = error.flatten()
  
  for (const field in fieldErrors) {
    const messages = fieldErrors[field as keyof typeof fieldErrors]
    if (messages) {
      console.error(`  - ${field}: ${messages.join(', ')}`)
    }
  }
  process.exit(1)
}

export default defineNuxtModule({
  meta: {
    name: '@shelve/auth',
  },
  setup(options, nuxt) {
    try {
      const skipValidation = process.env.SKIP_ENV_VALIDATION
      const isNonVercelCI = process.env.CI && !process.env.VERCEL
      if (isNonVercelCI || skipValidation) {
        console.log('Non-Vercel CI environment detected or SKIP_ENV_VALIDATION is set. Skipping environment variable validation.')
        return
      }
      const env = envSchema.parse(process.env)
      
      const isGithubEnabled = !!(env.NUXT_OAUTH_GITHUB_CLIENT_ID && env.NUXT_OAUTH_GITHUB_CLIENT_SECRET)
      const isGoogleEnabled = !!(env.NUXT_OAUTH_GOOGLE_CLIENT_ID && env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET)
      const isEmailEnabled = !!env.NUXT_PRIVATE_RESEND_API_KEY
      
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

