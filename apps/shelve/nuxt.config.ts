import vue from '@vitejs/plugin-vue'

export default defineNuxtConfig({
  extends: '../base',

  compatibilityDate: '2025-01-24',

  hub: {
    db: {
      dialect: 'postgresql',
      applyMigrationsDuringBuild: process.env.HUB_APPLY_MIGRATIONS_DURING_BUILD !== 'false',
    },
  },

  ssr: false,

  nitro: {
    experimental: {
      openAPI: true
    },
    rollupConfig: {
      // @ts-expect-error - this is not typed
      plugins: [vue()]
    },
    imports: {
      dirs: ['./server/services', './server/utils']
    }
  },

  css: ['~/assets/css/index.css'],

  runtimeConfig: {
    public: {
      siteUrl: '',
    },
    private: {
      resendApiKey: '',
      resendWebhookSecret: '',
      encryptionKey: '',
      adminEmails: '',
      senderEmail: '',
      allowedOrigins: '',
      github: {
        privateKey: '',
      }
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

  $development: {
    runtimeConfig: {
      public: {
        siteUrl: 'http://localhost:3000',
        github: {
          appName: 'shelve-local',
        },
      },
    },
  },

  $production: {
    runtimeConfig: {
      public: {
        siteUrl: 'https://app.shelve.cloud',
        github: {
          appName: 'shelve-cloud',
        },
      },
    },
  },

  image: {
    format: ['webp', 'jpeg', 'jpg', 'png', 'svg']
  },

  modules: ['@nuxt/ui', '@nuxthub/core', '@onmax/nuxt-better-auth', './modules/hub-schema-fix', 'botid/nuxt'],
})
