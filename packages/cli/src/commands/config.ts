import { Command } from 'commander'
import { loadShelveConfig } from '../utils'

export function configCommand(program: Command): void {
  program
    .command('config')
    .alias('cf')
    .description('Show the current configuration')
    .action(async () => {
      console.log(await loadShelveConfig(true))
    })
}
