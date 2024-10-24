import vue from '@vitejs/plugin-vue'

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
      encryptionKey: process.env.NUXT_PRIVATE_ENCRYPTION_KEY,
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
    '@nuxt/scripts',
    '@nuxtjs/sitemap', // Pdcd0
    '@nuxtjs/seo' // P158a
  ],

  sitemap: {
    hostname: process.env.NUXT_PUBLIC_SITE_URL,
    routes: async () => {
      const { data } = await $fetch('/api/routes')
      return data.map(route => route.path)
    }
  }, // Paecc

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
