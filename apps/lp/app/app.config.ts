export default defineAppConfig({
  ui: {
    colors: {
      primary: 'orange'
    },
    icons: {
      light: 'heroicons:moon-solid',
      dark: 'heroicons:sun-solid'
    }
  },
  uiPro: {
    prose: {
      codeIcon: {
        'shelve.json': 'custom:shelve',
        'docker-compose.yml': 'simple-icons:docker'
      }
    }
  }
})
