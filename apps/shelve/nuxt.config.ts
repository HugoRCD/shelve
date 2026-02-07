import { randomBytes } from 'node:crypto'
import vue from '@vitejs/plugin-vue'

const fallbackBetterAuthSecret =
  (process.env.GITHUB_ACTIONS || process.env.VERCEL_ENV === 'preview')
    ? randomBytes(32).toString('hex')
    : ''

export default defineNuxtConfig({
  extends: '../base',

  compatibilityDate: '2025-01-24',

  hub: {
    db: {
      dialect: 'postgresql',
      applyMigrationsDuringBuild: process.env.HUB_APPLY_MIGRATIONS_DURING_BUILD === 'true',
    },
  },

  ssr: false,

  nitro: {
    experimental: {
      openAPI: true
    },
    rollupConfig: {
      plugins: [vue()]
    },
    imports: {
      dirs: ['./server/services', './server/utils']
    }
  },

  css: ['~/assets/css/index.css'],

  runtimeConfig: {
    betterAuthSecret: process.env.BETTER_AUTH_SECRET || process.env.NUXT_BETTER_AUTH_SECRET || fallbackBetterAuthSecret,
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
