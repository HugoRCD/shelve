import { note } from '@clack/prompts'
import { defineCommand } from 'citty'
import { CredentialsService } from '../services/credentials'

export default defineCommand({
  meta: {
    name: 'me',
    description: 'Show the currently logged-in user'
  },
  run() {
    const config = CredentialsService.readMeta()

    if (!config.email && !config.username) {
      note('You are not logged in')
      return
    }

    note(`You are logged in as ${config.username} <${config.email}>`, 'Current user')
  }
})
