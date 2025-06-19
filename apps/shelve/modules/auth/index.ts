import { defineNuxtModule } from 'nuxt/kit'
import { z } from 'zod'

const envSchema = z.object({
  NUXT_OAUTH_GITHUB_CLIENT_ID: z.string().optional(),
  NUXT_OAUTH_GITHUB_CLIENT_SECRET: z.string().optional(),
  NUXT_OAUTH_GOOGLE_CLIENT_ID: z.string().optional(),
  NUXT_OAUTH_GOOGLE_CLIENT_SECRET: z.string().optional(),
  NUXT_PRIVATE_GITHUB_PRIVATE_KEY: z.string().optional(),
  NUXT_SESSION_PASSWORD: z.string(),
  NUXT_PRIVATE_ENCRYPTION_KEY: z.string(),
  NUXT_PRIVATE_RESEND_API_KEY: z.string().optional(),
  NUXT_PRIVATE_ADMIN_EMAILS: z.string().optional(),
  NUXT_PRIVATE_SENDER_EMAIL: z.string().optional(),
  NUXT_PRIVATE_ALLOWED_ORIGINS: z.string().optional(),
})

export default defineNuxtModule({
  meta: {
    name: '@shelve/auth',
  },
  setup(options, nuxt) {
    nuxt.hook('ready', () => {
      let isGithubEnabled = false
      let isGoogleEnabled = false

      const env = envSchema.parse(process.env)

      if (env.NUXT_OAUTH_GITHUB_CLIENT_ID && env.NUXT_OAUTH_GITHUB_CLIENT_SECRET)
        isGithubEnabled = true
      if (env.NUXT_OAUTH_GOOGLE_CLIENT_ID && env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET)
        isGoogleEnabled = true

      nuxt.options.appConfig.googleEnabled = isGoogleEnabled
      nuxt.options.appConfig.githubEnabled = isGithubEnabled
    })
  }
})
