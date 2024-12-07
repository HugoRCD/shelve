export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  ssr: false,

  nitro: {
    imports: { //TODO this should be fixed in the next release
      dirs: ['server/utils'],
    },
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
