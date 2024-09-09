import { defineCommand } from 'citty'
import { consola } from 'consola'
import { loadUserConfig, writeUserConfig } from '../utils/config'
import { $api } from '../utils/connection'

export default defineCommand({
  meta: {
    name: 'login',
    description: 'Authenticate with Shelve App'
  },
  async setup() {
    const user = loadUserConfig()
    console.log(user)
    if (user.authToken) {
      const exit = await consola.prompt(`You are already logged as \`${user.username}\`, do you want to login again? (y/n)`, { type: 'confirm' })
      if (!exit) return
    }

    let selfInstanceUrl = ''
    const isSelfHosted = await consola.prompt('Is this a self-hosted instance? (y/n)', {
      default: 'n',
      type: 'confirm',
    })

    if (isSelfHosted) {
      selfInstanceUrl = await consola.prompt('Enter the URL of your instance') as string
      if (!selfInstanceUrl.endsWith('/')) selfInstanceUrl += '/'
    }

    const token = await consola.prompt(`Enter a valid token created at ${selfInstanceUrl ? selfInstanceUrl : 'https://shelve.hrcd.fr'}app/tokens`) as string

    writeUserConfig({
      ...user,
      url: selfInstanceUrl || 'https://shelve.hrcd.fr',
      authToken: token,
    })

    const response = await $api('/auth/currentUser', {
      method: 'GET',
    })
    const loggedUser = response.user

    consola.info(`Authentication successful, you are now logged in as \`${loggedUser.username}\``)

    writeUserConfig({
      url: selfInstanceUrl || 'https://shelve.hrcd.fr',
      username: loggedUser.username || loggedUser.email,
      email: loggedUser.email,
      authToken: token,
    })
  },
})
