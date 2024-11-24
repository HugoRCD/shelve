export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',

  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  routeRules: {
    '/': { isr: true, prerender: true },
    '/vault': { isr: true, prerender: true },
    '/docs': { isr: true, prerender: true },
  },

  modules: [
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/ui',
    'nuxt-build-cache',
    '@nuxt/scripts',
    '@nuxtjs/seo',
    '@shelve/crypto'
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

  imports: {
    presets: [
      {
        from: 'vue-sonner',
        imports: ['toast']
      }
    ]
  },

  icon: {
    clientBundle: {
      scan: true,
      includeCustomCollections: true
    },
    provider: 'iconify'
  },

  css: ['~/assets/style/main.css'],

  colorMode: {
    preference: 'dark',
    fallback: 'dark'
  },
})
