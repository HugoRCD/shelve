import { defineCommand } from 'citty'
import consola from 'consola'
import { loadUserConfig } from '../utils/config'

export default defineCommand({
  meta: {
    name: 'whoami',
    description: 'Shows the username of the currently logged in user.',
  },
  args: {
    f: {
      description: 'Show the full config or just the name',
    }
  },
  setup(ctx) {
    const { f } = ctx.args
    const user = loadUserConfig()
    if (!user.authToken) {
      consola.info('Not currently logged in.')
      return
    }
    if (f) {
      consola.info(JSON.stringify(user, null, 2))
      return
    }
    consola.info(`Logged in as \`${user.username}\``)
  },
})
