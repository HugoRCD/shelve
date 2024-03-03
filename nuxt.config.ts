// https://nuxt.com/docs/api/configuration/nuxt-config
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

  modules: ['blanked', "@nuxt/image", "@vue-email/nuxt"],

  css: ['~/assets/style/main.css'],

  vueEmail: {
    autoImport: true,
  },

  devtools: { enabled: true }
})
