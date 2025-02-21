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
    description: 'The all-in-one development workspace',
    full: {
      title: 'Shelve Landing-Page and documentation',
      description: 'This is the full documentation for Shelve. It includes all the Markdown files written with the MDC syntax.'
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
      },
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
