import { Command } from 'commander'
import { intro, outro } from '@clack/prompts'
import type { User } from '@types'
import { loadShelveConfig } from '../utils'
import { BaseService } from '../services/base'

export function loginCommand(program: Command): void {
  program
    .command('login')
    .alias('l')
    .description('Login to Shelve')
    .action(async () => {
      const { url } = await loadShelveConfig()

      intro(`Login to Shelve on ${url}`)

      const { user } = await BaseService.getToken(true) as { user: User }

      outro(`Successfully logged in as ${user.username}`)
    })
}
