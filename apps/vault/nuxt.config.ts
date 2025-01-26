export default defineNuxtConfig({
  extends: '../base',

  compatibilityDate: '2024-11-01',

  routeRules: {
    '/': { isr: true, prerender: true }
  },

  modules: ['@nuxt/scripts'],

  runtimeConfig: {
    private: {
      encryptionKey: '',
      vault: {
        url: ''
      },
    },
  },

  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4
  },

  css: ['~/assets/css/index.css'],
})
