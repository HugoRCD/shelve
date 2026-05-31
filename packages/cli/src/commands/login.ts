import { defineCommand } from 'citty'
import type { User } from '@types'
import { loadShelveConfig } from '../utils'
import { BaseService } from '../services/base'
import { cliIntro, cliSuccess } from '../utils/output'

export default defineCommand({
  meta: {
    name: 'login',
    description: 'Login to Shelve',
  },
  args: {
    token: {
      type: 'string',
      description: 'API token (or set SHELVE_TOKEN)',
      required: false,
    },
    withToken: {
      type: 'boolean',
      description: 'Paste an API token instead of browser device login',
      default: false,
    },
    noBrowser: {
      type: 'boolean',
      description: 'Do not open a browser; show the authorization URL and code only',
      default: false,
    },
  },
  async run({ args }) {
    const { url } = await loadShelveConfig()

    cliIntro(`Login to Shelve on ${url}`)

    const { user } = await BaseService.getToken(true, args.token, {
      withToken: args.withToken,
      noBrowser: args.noBrowser,
    }) as { user: User, token: string }

    cliSuccess(
      { username: user.username, email: user.email },
      `Successfully logged in as ${user.username}`,
      'login',
    )
  },
})
