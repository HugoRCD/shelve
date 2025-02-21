export default defineNuxtConfig({
  routeRules: {
    '/': { isr: true, prerender: true }
  },

  future: {
    compatibilityVersion: 4,
  },

  modules: [
    '@nuxt/ui-pro',
    '@nuxtjs/seo',
    '@nuxt/content',
    'nuxt-og-image',
    '@nuxt/scripts',
    '@nuxthub/core',
    'nuxt-llms',
  ],

  content: {
    preview: {
      api: 'https://api.nuxt.studio',
      dev: true,
    }
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
      failOnError: false,
      routes: ['/sitemap.xml']
    },
  },

  experimental: {
    viewTransition: true,
  },

  image: {
    provider: 'ipx'
  },

  site: {
    url: 'https://shelve.cloud',
    defaultLocale: 'en',
    indexable: true,
  },

  css: ['~/assets/css/index.css'],

  extends: '../base',
})
