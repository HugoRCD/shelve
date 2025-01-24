export default defineNuxtConfig({
  routeRules: {
    '/': { isr: true, prerender: true },
    '/vault': { isr: true, prerender: true }
  },

  modules: [
    '@nuxt/ui-pro',
    '@nuxtjs/seo',
    '@nuxt/content',
    'nuxt-og-image',
    '@nuxt/scripts'
  ],

  content: {
    preview: {
      api: 'https://api.nuxt.studio'
    }
  },

  mdc: {
    highlight: {
      theme: {
        dark: 'github-dark',
        default: 'github-dark',
        light: 'github-light',
      }
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      failOnError: false,
      routes: ['/sitemap.xml']
    },
  },

  image: {
    provider: 'ipx'
  },

  site: {
    url: 'https://shelve.cloud',
    defaultLocale: 'en',
    indexable: true,
  },
})
