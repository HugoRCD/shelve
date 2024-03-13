export default defineNuxtConfig({
  app: {
    head: {
      viewport: "width=device-width, initial-scale=1",
      charset: "utf-8",
      meta: [
        {
          name: "author",
          content: "Hugo Richard",
        },
      ],
    },
  },

  routeRules: {
    "/": { isr: true, prerender: true },
    "/app/**": { ssr: false },
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
    },
    private: {
      resendApiKey: process.env.NUXT_PRIVATE_RESEND_API_KEY,
      authSecret: process.env.NUXT_PRIVATE_AUTH_SECRET,
    },
  },

  modules: [
    "@nuxt/image",
    "@vue-email/nuxt",
    "@nuxt/ui",
    "@nuxt/fonts",
    "@vueuse/nuxt",
    "nuxt-build-cache"
  ],

  css: ['~/assets/style/main.css'],

  vueEmail: {
    autoImport: true,
  },

  ui: {
    icons: ["lucide"]
  },

  devtools: { enabled: true },

  imports: {
    presets: [
      {
        from: 'vue-sonner',
        imports: ['toast']
      }
    ]
  }
})