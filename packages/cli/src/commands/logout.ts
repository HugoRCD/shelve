import { writeUser } from 'rc9'
import { intro, outro } from '@clack/prompts'
import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'logout',
    description: 'Logout from Shelve locally'
  },
  run() {
    intro('Logging out')

    writeUser({ }, '.shelve')

    outro('Successfully logged out')
  }
})
