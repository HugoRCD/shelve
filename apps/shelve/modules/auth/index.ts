import { defineNuxtModule } from 'nuxt/kit'
import { z } from 'zod'

const envSchema = z.object({
  // OAuth GitHub
  NUXT_OAUTH_GITHUB_CLIENT_ID: z.string().optional().default(''),
  NUXT_OAUTH_GITHUB_CLIENT_SECRET: z.string().optional().default(''),
  
  // OAuth Google
  NUXT_OAUTH_GOOGLE_CLIENT_ID: z.string().optional().default(''),
  NUXT_OAUTH_GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  
  // GitHub Integration
  NUXT_PRIVATE_GITHUB_PRIVATE_KEY: z.string().optional().default(''),
  
  // Database
  DATABASE_URL: z.string().default('').refine(val => val.length >= 1, {
    message: 'DATABASE_URL is required for database connection'
  }).refine(val => val.startsWith('postgres://') || val.startsWith('postgresql://'), {
    message: 'DATABASE_URL must be a valid PostgreSQL connection string'
  }),
  
  // Required core variables
  NUXT_SESSION_PASSWORD: z.string().default('').refine(val => val.length >= 1, {
    message: 'NUXT_SESSION_PASSWORD is required for application security'
  }).refine(val => val.length >= 32, {
    message: 'Session password must be at least 32 characters'
  }),
  NUXT_PRIVATE_ENCRYPTION_KEY: z.string().default('').refine(val => val.length >= 1, {
    message: 'NUXT_PRIVATE_ENCRYPTION_KEY is required for data encryption'
  }).refine(val => val.length >= 32, {
    message: 'Encryption key must be at least 32 characters'
  }),
  
  // Email configuration
  NUXT_PRIVATE_RESEND_API_KEY: z.string().optional().default('').refine(val => !val || val.startsWith('re_'), {
    message: 'Resend API key must start with "re_"'
  }),
  NUXT_PRIVATE_SENDER_EMAIL: z.string().optional().default('').refine(val => !val || z.string().email().safeParse(val).success, {
    message: 'Must be a valid email address'
  }),
  
  // Admin configuration
  NUXT_PRIVATE_ADMIN_EMAILS: z.string().optional().default(''),
  
  // Security
  NUXT_PRIVATE_ALLOWED_ORIGINS: z.string().optional().default(''),
}).superRefine((data, ctx) => {
  // GitHub OAuth validation
  const hasGithubId = !!data.NUXT_OAUTH_GITHUB_CLIENT_ID
  const hasGithubSecret = !!data.NUXT_OAUTH_GITHUB_CLIENT_SECRET
  
  if (hasGithubId && !hasGithubSecret) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'NUXT_OAUTH_GITHUB_CLIENT_SECRET is required when NUXT_OAUTH_GITHUB_CLIENT_ID is set',
      path: ['NUXT_OAUTH_GITHUB_CLIENT_SECRET']
    })
  }
  
  if (hasGithubSecret && !hasGithubId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'NUXT_OAUTH_GITHUB_CLIENT_ID is required when NUXT_OAUTH_GITHUB_CLIENT_SECRET is set',
      path: ['NUXT_OAUTH_GITHUB_CLIENT_ID']
    })
  }
  
  // Google OAuth validation
  const hasGoogleId = !!data.NUXT_OAUTH_GOOGLE_CLIENT_ID
  const hasGoogleSecret = !!data.NUXT_OAUTH_GOOGLE_CLIENT_SECRET
  
  if (hasGoogleId && !hasGoogleSecret) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'NUXT_OAUTH_GOOGLE_CLIENT_SECRET is required when NUXT_OAUTH_GOOGLE_CLIENT_ID is set',
      path: ['NUXT_OAUTH_GOOGLE_CLIENT_SECRET']
    })
  }
  
  if (hasGoogleSecret && !hasGoogleId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'NUXT_OAUTH_GOOGLE_CLIENT_ID is required when NUXT_OAUTH_GOOGLE_CLIENT_SECRET is set',
      path: ['NUXT_OAUTH_GOOGLE_CLIENT_ID']
    })
  }
  
  // Admin emails validation
  if (data.NUXT_PRIVATE_ADMIN_EMAILS) {
    const emails = data.NUXT_PRIVATE_ADMIN_EMAILS.split(',').map(email => email.trim())
    for (const email of emails) {
      if (!z.string().email().safeParse(email).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid email format in NUXT_PRIVATE_ADMIN_EMAILS: ${email}`,
          path: ['NUXT_PRIVATE_ADMIN_EMAILS']
        })
      }
    }
  }
  
  // Allowed origins validation
  if (data.NUXT_PRIVATE_ALLOWED_ORIGINS) {
    const origins = data.NUXT_PRIVATE_ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    for (const origin of origins) {
      try {
        new URL(origin)
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid URL format in NUXT_PRIVATE_ALLOWED_ORIGINS: ${origin}`,
          path: ['NUXT_PRIVATE_ALLOWED_ORIGINS']
        })
      }
    }
  }
})

export default defineNuxtModule({
  meta: {
    name: '@shelve/auth',
  },
  setup(options, nuxt) {
    nuxt.hook('ready', () => {
      try {
        const env = envSchema.parse(process.env)
        
        const isGithubEnabled = !!(env.NUXT_OAUTH_GITHUB_CLIENT_ID && env.NUXT_OAUTH_GITHUB_CLIENT_SECRET)
        const isGoogleEnabled = !!(env.NUXT_OAUTH_GOOGLE_CLIENT_ID && env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET)
        const isEmailEnabled = !!env.NUXT_PRIVATE_RESEND_API_KEY
        
        nuxt.options.appConfig.googleEnabled = isGoogleEnabled
        nuxt.options.appConfig.githubEnabled = isGithubEnabled
        nuxt.options.appConfig.emailEnabled = isEmailEnabled
        
        // Log enabled configurations
        console.log('🔐 Auth configuration:')
        console.log(`  GitHub OAuth: ${isGithubEnabled ? '✅' : '❌'}`)
        console.log(`  Google OAuth: ${isGoogleEnabled ? '✅' : '❌'}`)
        console.log(`  Email service: ${isEmailEnabled ? '✅' : '❌'}`)
        
        // Warnings for partial configurations
        if (!isGithubEnabled && !isGoogleEnabled) {
          console.warn('⚠️  No OAuth providers configured. Users will only be able to use email authentication.')
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error('❌ Environment variables validation failed:')
          error.errors.forEach(err => {
            const fieldName = err.path.join('.')
            const { message } = err
            
            console.error(`  - ${fieldName}: ${message}`)
          })
          process.exit(1)
        }
        throw error
      }
    })
  }
})
