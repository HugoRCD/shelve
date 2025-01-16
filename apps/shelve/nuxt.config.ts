import vue from '@vitejs/plugin-vue'

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  ssr: false,

  nitro: {
    rollupConfig: {
      // @ts-expect-error - Vite config
      plugins: [vue()]
    }
  },

  $development: {
    routeRules: {
      '/api/**': {
        cors: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      },
    },
  },

  $production: {
    routeRules: {
      '/api/**': {
        cors: true,
        headers: {
          'Access-Control-Allow-Origin': 'https://*.shelve.cloud',
          'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
          'Access-Control-Allow-Credentials': 'true',
          'Vary': 'Origin'
        }
      },
    },
  },

  runtimeConfig: {
    private: {
      resendApiKey: '',
      encryptionKey: '',
      adminEmails: '',
      redis: {
        url: ''
      },
    },
    oauth: {
      google: {
        clientId: '',
        clientSecret: '',
      },
      github: {
        clientId: '',
        clientSecret: '',
      },
    }
  },

  modules: [
    '@vueuse/nuxt',
    'nuxt-auth-utils',
  ],

  extends: '../base',
})
