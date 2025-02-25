import { createResolver } from 'nuxt/kit'
import pkg from '../../package.json'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1',
      charset: 'utf-8',
    },
  },

  compatibilityDate: '2025-01-24',

  future: {
    compatibilityVersion: 4,
  },

  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },

  alias: {
    '@types': resolve('../../packages/types'),
    '@utils': resolve('../../packages/utils'),
  },

  modules: [
    '@nuxt/image',
    '@nuxt/ui',
    'nuxt-build-cache',
    'nuxt-visitors',
    'motion-v/nuxt'
  ],

  nitro: {
    experimental: {
      websocket: true
    }
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

  $development: {
    runtimeConfig: {
      public: {
        apiUrl: 'http://localhost:3001',
        version: pkg.version
      }
    }
  },

  $production: {
    runtimeConfig: {
      public: {
        apiUrl: 'https://app.shelve.cloud',
        version: pkg.version
      }
    }
  },

  css: ['./assets/css/base.css'],
})
