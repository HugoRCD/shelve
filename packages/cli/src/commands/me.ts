import { note } from '@clack/prompts'
import { readUser } from 'rc9'
import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'me',
    description: 'Show the currently logged-in user'
  },
  run() {
    const config = readUser('.shelve')

    if (!config.token) {
      note('You are not logged in')
      return
    }

    note(`You are logged in as ${config.username} <${config.email}>`, 'Current user')
  }
})
