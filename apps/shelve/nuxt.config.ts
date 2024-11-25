import { createResolver } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1',
      charset: 'utf-8',
    },
  },

  compatibilityDate: '2024-11-06',

  future: {
    compatibilityVersion: 4,
  },

  experimental: {
    viewTransition: true,
  },

  hub: {
    database: true,
    kv: true,
    blob: true,
    cache: true,
  },

  ssr: false,

  nitro: {
    preset: 'cloudflare-pages',
    storage: {
      cache: {
        driver: 'redis',
        url: process.env.NUXT_PRIVATE_REDIS_URL || 'redis://shelve_redis:6379',
      },
    }
  },

  runtimeConfig: {
    private: {
      resendApiKey: '',
      encryptionKey: '',
      adminEmails: '',
    },
    oauth: {
      google: {
        clientId: '',
        clientSecret: '',
      },
      github: {
        clientId: '',
        clientSecret: '',
      },
    }
  },

  modules: [
    '@nuxt/image',
    '@nuxt/ui',
    '@vueuse/nuxt',
    'nuxt-build-cache',
    'nuxt-auth-utils',
    '@shelve/crypto',
    '@nuxthub/core',
  ],

  css: ['~/assets/style/main.css'],

  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
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
        dir: resolve('./app/assets/icons')
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

  alias: {
    'string_decoder': 'string_decoder/',
  },
})
