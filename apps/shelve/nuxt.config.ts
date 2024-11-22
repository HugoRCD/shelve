/*
import vue from '@vitejs/plugin-vue'
rollupConfig: {
  // @ts-expect-error - vue is an external plugin
  plugins: [vue()]
},
*/

export default defineNuxtConfig({
  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1',
      charset: 'utf-8',
    },
  },

  compatibilityDate: '2024-07-05',

  future: {
    compatibilityVersion: 4,
  },

  experimental: {
    componentIslands: true,
  },

  ssr: false,

  nitro: {
    storage: {
      cache: {
        driver: 'redis',
        url: process.env.NUXT_PRIVATE_REDIS_URL || 'redis://shelve_redis:6379',
      },
    }
  },

  runtimeConfig: {
    public: {
      appUrl: '',
    },
    private: {
      resendApiKey: '',
      encryptionKey: '',
      adminEmails: '',
    },
    oauth: {
      github: {
        clientId: '',
        clientSecret: '',
      },
      google: {
        clientId: '',
        clientSecret: '',
      }
    },
  },

  hub: {
    database: true,
    kv: true,
    blob: true,
    cache: true,
  },

  modules: [
    '@nuxt/image',
    '@nuxt/ui',
    '@vueuse/nuxt',
    'nuxt-build-cache',
    'nuxt-auth-utils',
    '@nuxthub/core'
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
        dir: './app/assets/icons'
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
})
