import vue from '@vitejs/plugin-vue'

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  ssr: false,

  nitro: {
    rollupConfig: {
      // @ts-expect-error - this is not typed
      plugins: [vue()]
    }
  },

  $development: {
    routeRules: {
      '/api/**': { cors: true },
    },
  },

  $production: {
    routeRules: {
      '/api/**': { cors: true }
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

  extends: './base',
  compatibilityDate: '2025-01-24',
})
