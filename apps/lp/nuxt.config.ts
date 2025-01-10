export default defineNuxtConfig({
  routeRules: {
    '/': { isr: true, prerender: true },
    '/vault': { isr: true, prerender: true },
    '/docs': { isr: true, prerender: true },
  },

  future: {
    compatibilityVersion: 4,
  },

  modules: [
    '@nuxt/ui-pro',
    '@nuxt/content',
    'nuxt-og-image',
    '@nuxt/scripts',
    '@nuxtjs/seo'
  ],

  runtimeConfig: {
    private: {
      encryptionKey: '',
      vault: {
        url: ''
      },
    },
  },

  nitro: {
    prerender: {
      routes: ['/sitemap.xml', '/vault']
    },
  },

  experimental: {
    viewTransition: true,
  },

  sitemap: {
    enabled: false
  },
  robots: {
    enabled: false
  },
  schemaOrg: {
    enabled: false
  },
  linkChecker: {
    enabled: false
  },

  site: {
    url: 'https://shelve.cloud',
    name: 'Shelve',
    description: 'Shelve is a project management tool for developers teams',
    defaultLocale: 'en',
    indexable: true,
  },

  css: ['~/assets/css/index.css'],

  extends: '../base',
})
