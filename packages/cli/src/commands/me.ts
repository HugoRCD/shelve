import { defineCommand } from 'citty'
import { CredentialsService } from '../services/credentials'
import { cliSuccess } from '../utils/output'

export default defineCommand({
  meta: {
    name: 'me',
    description: 'Show the currently logged-in user',
  },
  run() {
    const config = CredentialsService.readMeta()

    if (!config.email && !config.username) {
      cliSuccess({ loggedIn: false }, 'You are not logged in', 'me')
      return
    }

    const displayParts: string[] = []
    if (config.username) displayParts.push(config.username)
    if (config.email) displayParts.push(`<${config.email}>`)

    cliSuccess(
      { loggedIn: true, username: config.username, email: config.email },
      displayParts.length ? `You are logged in as ${displayParts.join(' ')}` : 'You are logged in',
      'me',
    )
  },
})
