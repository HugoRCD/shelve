#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineCommand, runMain } from 'citty'
import consola from 'consola'
import { GLOBAL_CLI_ARGS, initCliContextFromArgv, initDebugFromArgv, setDebug } from './constants'
import { CliError, toCliError } from './services/api-error'
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

/**
 * Reports errors through cliError so `--json` gets the documented envelope.
 *
 * citty's runMain catches everything itself and prints a raw stack trace, which
 * means the handler below it never sees a failing command. Catching inside each
 * subcommand gets in ahead of it.
 */
function reportErrors<T extends { run?: unknown }>(command: T): T {
  const { run } = command
  if (typeof run !== 'function') return command

  return {
    ...command,
    async run(context: unknown): Promise<unknown> {
      try {
        return await run(context)
      } catch (error) {
        cliError(toCliError(error))
      }
    },
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
    run: reportErrors(run),
    push: reportErrors(push),
    pull: reportErrors(pull),
    diff: reportErrors(diff),
    sync: reportErrors(sync),
    login: reportErrors(login),
    logout: reportErrors(logout),
    me: reportErrors(me),
    init: reportErrors(init),
    doctor: reportErrors(doctor),
    create: reportErrors(create),
    config: reportErrors(config),
    generate: reportErrors(generate),
    upgrade: reportErrors(upgrade),
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
