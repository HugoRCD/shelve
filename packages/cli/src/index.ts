#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineCommand, runMain } from 'citty'
import consola from 'consola'
import { GLOBAL_CLI_ARGS, initCliContextFromArgv, initDebugFromArgv, setDebug } from './constants'
import { CliError } from './services/api-error'
import { cliError } from './utils/output'
import push from './commands/push'
import pull from './commands/pull'
import diff from './commands/diff'
import sync from './commands/sync'
import config from './commands/config'
import generate from './commands/generate'
import create from './commands/create'
import login from './commands/login'
import me from './commands/me'
import logout from './commands/logout'
import upgrade from './commands/upgrade'
import run from './commands/run'
import init from './commands/init'
import doctor from './commands/doctor'
import { formatErrorCodesHelp } from './utils/error-codes'

initDebugFromArgv()
initCliContextFromArgv()

process.stdin.on?.('error', (err: NodeJS.ErrnoException) => {
  if (err && err.code === 'EIO') {
    process.exit(129)
  }
})

function getCliPackageVersion(): string {
  try {
    const here = dirname(fileURLToPath(import.meta.url))
    const { version } = JSON.parse(readFileSync(join(here, '..', 'package.json'), 'utf-8'))
    return version || 'unknown'
  } catch {
    return 'unknown'
  }
}

const main = defineCommand({
  meta: {
    name: 'shelve',
    description: `Shelve CLI — manage team secrets from the terminal.

${formatErrorCodesHelp()}`,
    version: getCliPackageVersion(),
  },
  args: GLOBAL_CLI_ARGS,
  setup({ args }) {
    if (args.debug) setDebug(true)
    initCliContextFromArgv()
  },
  subCommands: {
    run,
    push,
    pull,
    diff,
    sync,
    login,
    logout,
    me,
    init,
    doctor,
    create,
    config,
    generate,
    upgrade,
  },
})

runMain(main).then((_) => {
  process.exit(0)
}).catch((err) => {
  if (err instanceof CliError) {
    cliError({
      code: err.code,
      message: err.message,
      status: err.status,
      hint: err.hint,
    })
  }
  consola.error(err)
  process.exit(1)
})
