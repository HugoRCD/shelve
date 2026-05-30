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

    cliSuccess(
      { loggedIn: true, username: config.username, email: config.email },
      `You are logged in as ${config.username} <${config.email}>`,
      'me',
    )
  },
})
