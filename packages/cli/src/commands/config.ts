
import { Command } from 'commander'
import { showConfig } from '../utils/config'

export function configCommand(program: Command) {
  program
    .command('config')
    .description('Manage Shelve config')
    .action(showConfig)
}
