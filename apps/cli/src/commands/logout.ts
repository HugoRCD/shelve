import { defineCommand } from 'citty'
import { consola } from 'consola'
import { loadUserConfig, writeUserConfig } from '../utils/config'

export default defineCommand({
  meta: {
    name: 'logout',
    description: 'Logout the current authenticated user',
  },
  setup() {
    const user = loadUserConfig()
    if (!user.authToken) {
      consola.info('Not currently logged in.')
      return
    }

    const config = loadUserConfig()
    config.authToken = null
    writeUserConfig(config)

    consola.info('You have been logged out.')
  },
})
