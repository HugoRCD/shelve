export default defineNuxtConfig({
  extends: '../base',

  icon: {
    customCollections: [{ prefix: 'custom', dir: './app/assets/icons' }],
  },

  compatibilityDate: '2024-11-01',

  routeRules: {
    '/**': {
      headers: {
        'Content-Security-Policy': 'frame-ancestors \'none\'',
        'X-Frame-Options': 'DENY',
      },
    },
    '/': { prerender: true }
  },

  modules: ['@nuxt/ui', '@nuxt/scripts', '@nuxtjs/mdc', '@nuxthub/core'],

  hub: {
    kv: true,
  },

  runtimeConfig: {
    private: {
      encryptionKey: '',
    },
  },

  devtools: { enabled: true },

  css: ['~/assets/css/index.css'],

  $test: {
    modules: ['@nuxthub/core'],
  },
})
