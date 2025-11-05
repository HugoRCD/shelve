export default defineNuxtConfig({
  extends: '../base',

  compatibilityDate: '2024-11-01',

  routeRules: {
    '/': { prerender: true }
  },

  modules: ['@nuxt/ui', '@nuxt/scripts', '@nuxtjs/mdc', '@nuxthub/core'],

  runtimeConfig: {
    private: {
      redis: {
        url: '',
      },
      encryptionKey: '',
    },
  },

  $development: {
    nitro: {
      storage: {
        vault: {
          driver: 'memory'
        }
      }
    }
  },

  devtools: { enabled: true },

  css: ['~/assets/css/index.css'],
})
