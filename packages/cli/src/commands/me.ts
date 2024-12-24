import { Command } from 'commander'
import { note } from '@clack/prompts'
import { readUser } from 'rc9'

export function meCommand(program: Command): void {
  program
    .command('me')
    .alias('m')
    .description('Show current user')
    .action(() => {
      const config = readUser('.shelve')

      if (!config.token) {
        note('You are not logged in')
        return
      }

      note(`You are logged in as ${config.username} <${config.email}>`, 'Current user')
    })
}
