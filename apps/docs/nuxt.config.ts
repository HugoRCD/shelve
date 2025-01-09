export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4
  },
  experimental: {
    viewTransition: true,
  },
  modules: [
    '@nuxt/ui-pro',
    '@nuxt/content',
    'nuxt-og-image',
    '@nuxt/scripts',
  ],
  routeRules: {
    '/': { redirect: '/getting-started', prerender: false },
  },
  site: {
    url: 'https://docs.shelve.cloud'
  },
  nitro: {
    prerender: {
      routes: ['/getting-started'],
      crawlLinks: true,
      autoSubfolderIndex: false
    },
  },
  css: ['~/assets/css/main.css'],
  extends: '../base',
})
