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
    preset: process.env.NITRO_PRESET || 'bun',
    storage: {
      cache: {
        driver: 'redis',
        url: process.env.NUXT_PRIVATE_REDIS_URL || 'redis://shelve_redis:6379',
      },
    }
  },

  runtimeConfig: {
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
    },
    private: {
      resendApiKey: process.env.NUXT_PRIVATE_RESEND_API_KEY,
      encryptionKey: process.env.NUXT_PRIVATE_ENCRYPTION_KEY,
      adminUsers: process.env.ADMIN_USERS,
    },
  },

  modules: [
    '@nuxt/image',
    '@nuxt/ui',
    '@vueuse/nuxt',
    'nuxt-build-cache',
    'nuxt-auth-utils'
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
  },

  colorMode: {
    preference: 'dark',
    fallback: 'dark'
  },
})
