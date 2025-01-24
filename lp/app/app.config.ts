export default defineAppConfig({
  ui: {
    icons: {
      light: 'heroicons:moon-solid',
      dark: 'heroicons:sun-solid',
      external: 'lucide:arrow-up-right',
    }
  },
  uiPro: {
    prose: {
      codeIcon: {
        'shelve.json': 'custom:shelve',
        'docker-compose.yml': 'simple-icons:docker'
      }
    },
    pageSection: {
      slots: {
        container: 'py-10 sm:py-10 lg:py-16',
      }
    }
  }
})
