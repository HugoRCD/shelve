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
    '@nuxt/content',
    '@nuxt/scripts',
    '@nuxtjs/seo'
  ],

  runtimeConfig: {
    private: {
      encryptionKey: '',
    },
  },

  nitro: {
    preset: process.env.NITRO_PRESET || 'bun',
    prerender: {
      routes: ['/sitemap.xml', '/vault']
    },
    storage: {
      vault: {
        driver: 'redis',
        url: process.env.NUXT_PRIVATE_VAULT_URL,
      },
    }
  },

  site: {
    url: 'https://shelve.cloud',
    name: 'Shelve',
    description: 'Shelve is a project management tool for developers teams',
    defaultLocale: 'en',
    indexable: true,
  },

  css: ['~/assets/style/main.css'],

  extends: '../base',
})
