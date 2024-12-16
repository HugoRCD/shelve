export default defineNuxtConfig({
  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1',
      charset: 'utf-8',
    },
  },

  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },

  modules: [
    '@nuxt/image',
    '@nuxt/ui',
    'nuxt-build-cache'
  ],

  compatibilityDate: '2024-11-06',

  future: {
    compatibilityVersion: 4,
  },

  experimental: {
    viewTransition: true,
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
    customCollections: [
      {
        prefix: 'custom',
        dir: './app/assets/icons'
      },
      {
        prefix: 'nucleo',
        dir: './app/assets/icons/nucleo'
      },
    ],
    clientBundle: {
      scan: true,
      includeCustomCollections: true
    },
    provider: 'iconify'
  },

  colorMode: {
    preference: 'dark',
    fallback: 'dark'
  },

  css: ['./assets/css/base.css'],
})
