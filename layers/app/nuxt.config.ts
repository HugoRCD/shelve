import vue from '@vitejs/plugin-vue'

export default defineNuxtConfig({
  nitro: {
    rollupConfig: {
      // @ts-expect-error - this is not typed
      plugins: [vue()]
    }
  },

  $development: {
    routeRules: {
      '/api/**': { cors: true },
    },
  },

  $production: {
    routeRules: {
      '/api/**': { cors: true }
    },
  },

  modules: [
    '@vueuse/nuxt',
    'nuxt-auth-utils',
  ],

  compatibilityDate: '2025-01-24',
})
