import { defineCommand } from 'citty'
import consola from 'consola'
import { loadUserConfig, writeUserConfig } from '../utils/config'
import { $api } from '../utils/connection'

export default defineCommand({
  meta: {
    name: 'token',
    description: 'Update your token',
  },
  async setup() {
    const user = loadUserConfig()

    const token = await consola.prompt(`Enter a valid token created at ${user.url}app/tokens`) as string

    writeUserConfig({
      ...user,
      authToken: token,
    })

    const response = await $api('/auth/currentUser', {
      method: 'GET',
    })
    const loggedUser = response.user

    consola.info(`Authentication successful, you are now logged in as \`${loggedUser.username}\``)
  }
})
