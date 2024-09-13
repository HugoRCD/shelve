import { Command } from 'commander'
import { loadShelveConfig } from '../utils/config'

export function configCommand(program: Command): void {
  program
    .command('config')
    .description('Manage Shelve config')
    .action(async () => {
      console.log(await loadShelveConfig())
    })
}
