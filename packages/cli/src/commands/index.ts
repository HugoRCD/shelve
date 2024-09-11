import { Command } from 'commander'
import { configCommand } from './config'
import { pullCommand } from './pull'
import { pushCommand } from './push'

export function registerCommands(program: Command): void {
  configCommand(program)
  pullCommand(program)
  pushCommand(program)
}
