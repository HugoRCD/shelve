import pkg from './package.json'

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  experimental: {
    viewTransition: true,
  },

  imports: {
    presets: [
      {
        from: 'vue-sonner',
        imports: ['toast']
      }
    ]
  },

  nitro: {
    experimental: {
      websocket: true
    }
  },

  icon: {
    customCollections: [
      {
        prefix: 'custom',
        dir: './app/assets/icons'
      },
      {
        prefix: 'nucleo',
        dir: './app/assets/icons/nucleo'
      },
    ],
    clientBundle: {
      scan: true,
      includeCustomCollections: true
    },
    provider: 'iconify'
  },

  runtimeConfig: {
    public: {
      version: pkg.version
    },
    private: {
      resendApiKey: '',
      encryptionKey: '',
      adminEmails: '',
      vault: {
        url: ''
      },
      redis: {
        url: ''
      },
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

  extends: [
    './layers/base',
    `./layers/${process.env.LAYER}`
  ],

  css: [
    '~/assets/css/base.css',
    `./layers/${process.env.LAYER}/assets/css/index.css`
  ],

  compatibilityDate: '2025-01-24',
})
