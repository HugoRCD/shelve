import { Command } from 'commander'
import { configCommand } from './config'
import { pullCommand } from './pull'
import { pushCommand } from './push'
import { generateCommand } from './generate'
import { createCommand } from './create'

export function registerCommands(program: Command): void {
  createCommand(program)
  pullCommand(program)
  pushCommand(program)
  generateCommand(program)
  configCommand(program)
}
