import { Command } from 'commander'
import { updateUser } from 'rc9'
import { intro, outro } from '@clack/prompts'

export function logoutCommand(program: Command): void {
  program
    .command('logout')
    .alias('lo')
    .description('Logout from Shelve locally')
    .action(() => {
      intro('Logging out')

      updateUser({ token: '' }, '.shelve')

      outro('Successfully logged out')
    })
}
