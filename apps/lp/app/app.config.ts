export default defineAppConfig({
  ui: {
    icons: {
      external: 'lucide:arrow-up-right',
    }
  },
  uiPro: {
    prose: {
      codeIcon: {
        'shelve.json': 'custom:shelve',
        'docker-compose.yml': 'simple-icons:docker'
      },
      a: {
        base: 'border-b border-secondary'
      }
    },
    pageSection: {
      slots: {
        container: 'py-10 sm:py-10 lg:py-16',
      }
    }
  }
})
