import vue from '@vitejs/plugin-vue'
import { createResolver } from 'nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  extends: '../base',

  compatibilityDate: '2025-01-24',

  hub: {
    db: 'postgresql',
  },

  ssr: false,

  routeRules: {
    // No page of the app may be shown inside another site's frame.
    '/**': { headers: { 'Content-Security-Policy': 'frame-ancestors \'none\'', 'X-Frame-Options': 'DENY' } },
  },

  nitro: {
    experimental: {
      openAPI: true
    },
    rollupConfig: {
      // @ts-expect-error - this is not typed
      plugins: [vue()]
    },
    imports: {
      dirs: ['./server/services']
    }
  },

  css: ['~/assets/css/index.css'],

  icon: {
    customCollections: [
      { prefix: 'custom', dir: './app/assets/icons' },
      { prefix: 'nucleo', dir: './app/assets/icons/nucleo' },
    ],
  },

  runtimeConfig: {
    public: {
      // Origin used in links sent outside the app (emails, CLI login). Required outside Vercel.
      appUrl: '',
    },
    private: {
      // Audit log entries older than this many days are deleted; 0 keeps every entry.
      auditRetentionDays: 30,
      resendApiKey: '',
      resendWebhookSecret: '',
      encryptionKey: '',
      adminEmails: '',
      senderEmail: '',
      allowedOrigins: '',
      // Proxies in front of Shelve that append to X-Forwarded-For; 0 uses the connection's address. Vercel counts as 1.
      trustProxy: 0,
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
        github: {
          appName: 'shelve-local',
        },
      },
    },
  },

  $production: {
    hub: {
      // One store for every instance (Vercel Runtime Cache on Vercel), so `clearCache` reaches all of them.
      // The tag lets `useStorage('cache').clear()` expire every entry, as that driver can't list keys.
      cache: {
        tags: ['shelve-app'],
      },
    },
    runtimeConfig: {
      public: {
        github: {
          appName: 'shelve-cloud',
        },
      },
    },
  },

  image: {
    format: ['webp', 'jpeg', 'jpg', 'png', 'svg']
  },

  modules: ['@nuxt/ui', 'nuxt-auth-utils', '@nuxthub/core', 'botid/nuxt'],

  $test: {
    modules: ['nuxt-auth-utils', '@nuxthub/core'],
    hub: {
      db: {
        dialect: 'postgresql',
        driver: 'pglite',
      },
    },
    // Test-only server code: a route that signs in a seeded user and a plugin that applies
    // migrations at boot. Other builds never include them.
    serverHandlers: [{ route: '/api/_test/seed', method: 'post', handler: resolve('./test/e2e/server/seed.post.ts') }],
    nitro: {
      plugins: [resolve('./test/e2e/server/test-migrations.ts')],
    },
  },
})
