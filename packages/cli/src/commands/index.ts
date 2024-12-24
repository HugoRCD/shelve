import { Command } from 'commander'
import { configCommand } from './config'
import { pullCommand } from './pull'
import { pushCommand } from './push'
import { generateCommand } from './generate'
import { createCommand } from './create'
import { upgradeCommand } from './upgrade'
import { loginCommand } from './login'
import { logoutCommand } from './logout'

export function registerCommands(program: Command): void {
  createCommand(program)
  pullCommand(program)
  pushCommand(program)
  generateCommand(program)
  upgradeCommand(program)
  configCommand(program)
  loginCommand(program)
  logoutCommand(program)
}
