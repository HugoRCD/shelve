export default defineNuxtConfig({
  extends: '../base',

  compatibilityDate: '2024-11-01',

  routeRules: {
    '/': { prerender: true }
  },

  modules: ['@nuxt/ui', '@nuxt/scripts'],

  runtimeConfig: {
    private: {
      encryptionKey: '',
    },
  },

  $production: {
    nitro: {
      storage: {
        vault: {
          driver: 'redis',
          url: process.env.REDIS_URL
        }
      }
    }
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

  future: {
    compatibilityVersion: 4
  },

  css: ['~/assets/css/index.css'],
})
