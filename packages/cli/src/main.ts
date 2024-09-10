import { Command } from 'commander'
import { version, description } from '../package.json'
import { registerCommands } from './commands'

const program = new Command()

program
  .version(version)
  .description(description)

registerCommands(program)

program.parse(process.argv)
