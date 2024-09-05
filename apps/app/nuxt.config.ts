import { getIconCollections } from '@egoist/tailwindcss-icons'
import vue from '@vitejs/plugin-vue'

export default defineNuxtConfig({
  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1',
      charset: 'utf-8',
      meta: [
        {
          name: 'author',
          content: 'Hugo Richard',
        },
      ],
    },
  },

  compatibilityDate: '2024-07-05',

  future: {
    compatibilityVersion: 4,
  },

  experimental: {
    componentIslands: true,
  },

  routeRules: {
    '/': { isr: true, prerender: true },
    '/login': { isr: true, prerender: true },
    '/app/**': { ssr: false },
  },

  nitro: {
    rollupConfig: {
      // @ts-expect-error - vue is an external plugin
      plugins: [vue()]
    },
    storage: {
      cache: {
        driver: 'redis',
        url: process.env.NUXT_PRIVATE_REDIS_URL,
      },
    }
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
    },
    private: {
      resendApiKey: process.env.NUXT_PRIVATE_RESEND_API_KEY,
      authSecret: process.env.NUXT_PRIVATE_AUTH_SECRET,
      secretEncryptionKey: process.env.NUXT_PRIVATE_SECRET_ENCRYPTION_KEY,
      secretEncryptionIterations: process.env.NUXT_PRIVATE_SECRET_ENCRYPTION_ITERATIONS,
    },
  },

  modules: [
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/fonts',
    '@vueuse/nuxt',
    'nuxt-build-cache',
    'nuxt-auth-utils',
    '@nuxt/scripts'
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
