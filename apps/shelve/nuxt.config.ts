import vue from '@vitejs/plugin-vue'

export default defineNuxtConfig({
  extends: '../base',

  compatibilityDate: '2025-01-24',

  future: {
    compatibilityVersion: 4,
  },

  ssr: false,

  nitro: {
    experimental: {
      openAPI: true
    },
    rollupConfig: {
      // @ts-expect-error - this is not typed
      plugins: [vue()]
    },
    imports: {
      dirs: ['./server/services']
    }
  },

  hub: {
    database: true,
    cache: true
  },

  /*$development: {
    hub: {
      remote: true
    }
  },*/

  runtimeConfig: {
    session: {
      name: 'shelve_session',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
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
})
