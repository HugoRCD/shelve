import { loadUserConfig, writeUserConfig } from '../utils/config'
import { defineCommand } from 'citty'
import { consola } from 'consola'

export default defineCommand({
  meta: {
    name: 'login',
    description: 'Authenticate with Shelve'
  },
  async setup() {
    const user = loadUserConfig()
    if (user) return consola.info(`You are already logged as \`${user.username}\``)

    const username = await consola.prompt('Enter your username') as string;
    writeUserConfig({ username });

    consola.info('You have been logged in.')
  },
})
