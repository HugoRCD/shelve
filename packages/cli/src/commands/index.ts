import { Command } from 'commander'
import { loginCommand } from './login'
import { configCommand } from './config'

export function registerCommands(program: Command) {
  loginCommand(program)
  configCommand(program)
}
