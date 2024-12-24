import { Command } from 'commander'
import { writeUser } from 'rc9'
import { intro, outro } from '@clack/prompts'
import { askPassword, loadShelveConfig } from '../utils'

export function loginCommand(program: Command): void {
  program
    .command('login')
    .alias('l')
    .description('Login to Shelve')
    .action(async () => {
      const { url } = await loadShelveConfig()

      intro(`Login to Shelve on ${url}`)

      const sanitizedUrl = url.replace(/\/+$/, '')
      const token = await askPassword(`Please provide a valid token (you can generate one on ${sanitizedUrl}/user/tokens)`)

      writeUser({ token }, '.shelve')

      outro('Successfully logged in')
    })
}
