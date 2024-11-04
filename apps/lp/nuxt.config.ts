// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',

  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  routeRules: {
    '/': { isr: true, prerender: true },
    '/vault': { isr: true, prerender: true },
  },

  modules: [
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/ui',
    'nuxt-build-cache',
    '@nuxt/scripts',
    '@nuxtjs/seo',
  ],

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
    },
  },

  nitro: {
    preset: process.env.NITRO_PRESET || 'bun',
    prerender: {
      routes: ['/sitemap.xml']
    },
  },

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL,
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

  css: ['~/assets/style/main.css'],
})
