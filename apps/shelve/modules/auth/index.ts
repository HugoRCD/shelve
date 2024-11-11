import { createResolver, defineNuxtModule, addServerHandler } from 'nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: '@shelve/auth',
  },
  setup(options, nuxt) {
    nuxt.hook('ready', () => {
      let isGithubEnabled = false
      let isGoogleEnabled = false

      if (process.env.NUXT_OAUTH_GITHUB_CLIENT_ID && process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET)
        isGithubEnabled = true
      if (process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID && process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET)
        isGoogleEnabled = true

      nuxt.options.appConfig.googleEnabled = isGoogleEnabled
      nuxt.options.appConfig.githubEnabled = isGithubEnabled
    })

    /*if (isGithubEnabled) {
      addServerHandler({
        route: '/auth/github',
        handler: resolve('./runtime/github')
      })
    }

    if (isGoogleEnabled) {
      addServerHandler({
        route: '/auth/google',
        handler: resolve('./runtime/google')
      })
    }*/
  }
})
