
export default defineNuxtConfig({
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

  colorMode: {
    preference: 'dark',
    fallback: 'dark'
  },

  $development: {
    runtimeConfig: {
      public: {
        apiUrl: 'http://localhost:3001',
      }
    }
  },

  $production: {
    runtimeConfig: {
      public: {
        apiUrl: 'https://app.shelve.cloud',
      }
    }
  },
})
