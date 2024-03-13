import { loadUserConfig, writeUserConfig } from '../utils/config'
import { defineCommand } from 'citty'
import { consola } from 'consola'

export default defineCommand({
  meta: {
    name: 'logout',
    description: 'Logout the current authenticated user',
  },
  async setup() {
    const user = loadUserConfig()
    if (!user) {
      consola.info('Not currently logged in.')
      return
    }

    const config = loadUserConfig()
    delete config.token
    writeUserConfig(config)

    consola.info('You have been logged out.')
  },
})
