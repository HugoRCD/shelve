// import vue from '@vitejs/plugin-vue'

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  ssr: false,

  nitro: {
    imports: { //TODO this should be fixed in the next release
      dirs: ['server/utils'],
    },
    /*rollupConfig: {
      plugins: [vue()]
    },*/
    storage: {
      cache: {
        driver: 'redis',
        url: process.env.NUXT_PRIVATE_REDIS_URL || 'redis://shelve_redis:6379',
      },
    }
  },

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
  ],

  extends: '../base',
})
