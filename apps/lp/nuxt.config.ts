export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },
    '/docs': { redirect: { statusCode: 301, to: '/docs/getting-started' } },
    '/docs/core-features': { redirect: { statusCode: 301, to: '/docs/core-features/environments' } },
    '/docs/integrations': { redirect: { statusCode: 301, to: '/docs/integrations/github' } },
    '/docs/self-hosting': { redirect: { statusCode: 301, to: '/docs/self-hosting/vercel' } },
  },

  future: {
    compatibilityVersion: 4,
  },

  modules: [
    '@nuxt/ui-pro',
    '@nuxtjs/seo',
    '@nuxt/content',
    '@nuxt/scripts',
    'nuxt-llms',
  ],

  content: {
    preview: {
      api: 'https://api.nuxt.studio',
    }
  },

  runtimeConfig: {
    public: {
      payloadId: process.env.NUXT_PUBLIC_PAYLOAD_ID,
    }
  },

  hub: {
    cache: true
  },

  llms: {
    domain: 'https://shelve.cloud',
    title: 'Shelve',
    description: 'Shelve is an all-in-one development workspace that revolutionizes how developers manage environments and collaborate on projects',
    full: {
      title: 'The full Shelve Landing-Page documentation, blog content for llms',
      description: 'The complete Shelve documentation and blog posts written in Markdown (MDC syntax).'
    },
    sections: [
      {
        title: 'Documentation',
        description: 'Technical documentation and guides',
        contentCollection: 'docs',
        contentFilters: [{ field: 'extension', operator: '=', value: 'md' }]
      },
      {
        title: 'Blog',
        description: 'Latest posts and insights',
        contentCollection: 'blog',
        contentFilters: [{ field: 'extension', operator: '=', value: 'md' }]
      }
    ],
  },

  mdc: {
    highlight: {
      theme: {
        dark: 'github-dark',
        default: 'github-dark',
        light: 'github-light',
      }
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      autoSubfolderIndex: false
    }
  },

  experimental: {
    viewTransition: true,
  },

  $development: {
    site: {
      url: 'http://localhost:3000'
    }
  },

  site: {
    url: 'https://shelve.cloud',
    defaultLocale: 'en',
    indexable: true,
  },

  css: ['~/assets/css/index.css'],

  extends: '../base',
})
