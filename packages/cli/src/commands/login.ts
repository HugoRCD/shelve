import { intro, outro } from '@clack/prompts'
import type { User } from '@types'
import { defineCommand } from 'citty'
import { loadShelveConfig } from '../utils'
import { BaseService } from '../services/base'

export default defineCommand({
  meta: {
    name: 'login',
    description: 'Login to Shelve'
  },
  async run() {
    const { url } = await loadShelveConfig()

    intro(`Login to Shelve on ${url}`)

    const { user } = await BaseService.getToken(true) as { user: User }

    outro(`Successfully logged in as ${user.username}`)
  }
})
