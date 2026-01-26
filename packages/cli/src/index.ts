#!/usr/bin/env node

import { defineCommand, runMain } from 'citty'
import { readPackageJSON } from 'pkg-types'
import consola from 'consola'
import push from './commands/push'
import pull from './commands/pull'
import config from './commands/config'
import generate from './commands/generate'
import create from './commands/create'
import login from './commands/login'
import me from './commands/me'
import logout from './commands/logout'
import upgrade from './commands/upgrade'
import run from './commands/run'

const pkg = await readPackageJSON().catch(() => ({ version: 'unknown' }))

const main = defineCommand({
  meta: {
    name: 'shelve',
    description: 'Shelve CLI',
    version: pkg.version,
  },
  subCommands: {
    run,
    push,
    pull,
    login,
    logout,
    me,
    create,
    config,
    generate,
    upgrade
  },
})

runMain(main).then((_) => {
  process.exit(0)
}).catch((err) => {
  consola.error(err)
  process.exit(1)
})
