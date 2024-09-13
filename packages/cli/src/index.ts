#!/usr/bin/env node

import { program } from 'commander'
import { version, description } from '../package.json'
import { registerCommands } from './commands'

program
  .name('shelve')
  .version(version)
  .description(description)

registerCommands(program)

program.parse(process.argv)
