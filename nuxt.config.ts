import vue from '@vitejs/plugin-vue'

export default defineNuxtConfig({
  extends: './apps/base',

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

  hub: {
    database: true,
    analytics: true,
    cache: true
  },

  /*$development: {
    hub: {
      remote: true
    }
  },*/

  runtimeConfig: {
    private: {
      resendApiKey: '',
      encryptionKey: '',
      adminEmails: '',
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
    '@nuxthub/core',
  ],

  compatibilityDate: '2025-01-24',
})
