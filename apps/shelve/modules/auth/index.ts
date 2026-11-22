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

// The values committed in `apps/shelve/.env.test`, only accepted while the test suite runs.
const TEST_SECRETS = ['test-app-secret-at-least-32-chars-long', 'test-encryption-key-at-least-32-chars']

/** Example values copied from the docs or `.env.test` instead of generated ones. */
function isPlaceholderSecret(value: string): boolean {
  if (/^your[-_]/i.test(value) || /^<.*>$/.test(value)) return true
  return !process.env.VITEST && TEST_SECRETS.includes(value)
}

function secretSchema(label: string) {
  return z.string()
    .min(32, { error: `${label} must be at least 32 characters long.` })
    .refine(value => !isPlaceholderSecret(value), {
      error: `${label} is an example value. Generate a random one with \`openssl rand -base64 48\`.`,
    })
}

function isOrigin(value: string): boolean {
  if (!URL.canParse(value)) return false
  const url = new URL(value)
  return url.pathname === '/' && !url.search && !url.hash && !url.username && !url.password
}

const requiredCoreSchema = z.object({
  DATABASE_URL: z.url().startsWith('postgres', { error: 'Must be a valid PostgreSQL URL.' }).optional(),
  NUXT_APP_SECRET: secretSchema('App secret'),
  NUXT_PRIVATE_ENCRYPTION_KEY: secretSchema('Encryption key'),
})

const appUrlSchema = z.object({
  NUXT_PUBLIC_APP_URL: z.url({ protocol: /^https?$/, error: 'App URL must be an http or https URL.' })
    .refine(isOrigin, { error: 'App URL must be an origin without a path, for example https://shelve.example.com.' })
    .optional()
    .or(z.literal('')),
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
  ...appUrlSchema.shape,
  ...authProvidersSchema.shape,
  ...emailSchema.shape,
  ...adminAndSecuritySchema.shape,
}).superRefine((data, ctx) => {
  validateOAuthPair(data, ctx, 'NUXT_OAUTH_GITHUB_CLIENT_ID', 'NUXT_OAUTH_GITHUB_CLIENT_SECRET', 'GitHub')
  validateOAuthPair(data, ctx, 'NUXT_OAUTH_GOOGLE_CLIENT_ID', 'NUXT_OAUTH_GOOGLE_CLIENT_SECRET', 'Google')
})

function handleValidationError(error: z.ZodError) {
  console.error('❌ Environment variables validation failed:')

  for (const issue of error.issues) {
    const fieldPath = issue.path.length > 0 ? issue.path.join('.') : 'root'
    console.error(`  - ${fieldPath}: ${issue.message}`)
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
