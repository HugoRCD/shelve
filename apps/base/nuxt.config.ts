export default defineNuxtConfig({
  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1',
      charset: 'utf-8',
    },
  },

  devtools: { enabled: true },

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
    mode: 'svg',
    customCollections: [
      {
        prefix: 'custom',
        dir: './app/assets/icons'
      },
    ],
    clientBundle: {
      scan: true,
      includeCustomCollections: true
    },
    provider: 'iconify'
  },

  nitro: {
    preset: process.env.NITRO_PRESET || 'bun',
  },

  colorMode: {
    preference: 'dark',
    fallback: 'dark'
  },

  css: ['./assets/css/base.css'],
})
