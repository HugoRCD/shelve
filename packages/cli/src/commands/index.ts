import { Command } from 'commander'
import { configCommand } from './config'
import { pullCommand } from './pull'

export function registerCommands(program: Command) {
  configCommand(program)
  pullCommand(program)
}
