import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import * as os from 'node:os'
import { defineCommand } from 'citty'
import { intro } from '@clack/prompts'
import type { EnvVarExport } from '@types'
import consola from 'consola'
import { handleCancel, loadShelveConfig } from '../utils'
import { EnvironmentService, EnvService, ProjectService } from '../services'
import { DEBUG } from '../constants'

export default defineCommand({
  meta: {
    name: 'run',
    description: '[experimental] Inject secrets from Shelve into your application process',
  },
  args: {
    env: {
      type: 'string',
      description: 'environment to use',
      required: false,
    },
  },
  async run({ args, rawArgs }) {
    const argv = parseRawArgs(rawArgs)
    if (argv.length === 0) {
      handleCancel('You must provide a command to run, e.g. `shelve run -- pnpm dev`')
    }

    const { project, slug, autoCreateProject, defaultEnv } = await loadShelveConfig(true)
    const envName = (typeof args.env === 'string' ? args.env : undefined) || defaultEnv

    intro(`Loading secrets for ${project} (${envName})`)

    const projectData = await ProjectService.getProjectByName(project, slug, autoCreateProject)
    const environment = await EnvironmentService.getEnvironment(slug, envName)
    const variables: EnvVarExport[] = await EnvService.getEnvVariables({
      project: projectData,
      environmentId: environment.id,
      slug,
    })

    const secretEnv: NodeJS.ProcessEnv = { ...process.env }
    for (const { key, value } of variables) secretEnv[key] = value

    await spawnChild(argv, secretEnv)
  },
})

function parseRawArgs(rawArgs: string[]): string[] {
  const sepIdx = rawArgs.indexOf('--')
  if (sepIdx >= 0) return rawArgs.slice(sepIdx + 1)
  return rawArgs.filter((arg) => !arg.startsWith('-'))
}

function resolveCommand(argv: string[]): { bin: string; argv: string[] } {
  if (argv.length === 0) throw new Error('Empty command')

  // Local `nr` (from @antfu/ni) is preferred for `pnpm dev`-style shorthand
  // but we never go through `npx` anymore — that adds ~200ms cold start
  // and breaks proper signal forwarding.
  const localNr = resolve(process.cwd(), 'node_modules/.bin/nr')
  if (existsSync(localNr) && argv.length === 1 && !argv[0]!.includes(' ')) {
    return { bin: localNr, argv }
  }

  return { bin: argv[0]!, argv: argv.slice(1) }
}

async function spawnChild(rawArgv: string[], env: NodeJS.ProcessEnv): Promise<ChildProcess> {
  const { bin, argv } = resolveCommand(rawArgv)
  const isWindows = process.platform === 'win32'

  const child = spawn(bin, argv, {
    env,
    stdio: 'inherit',
    // Detach so we can signal the entire process group: `npm start` style
    // commands often spawn their own children that the previous tree-kill
    // approach left as zombies.
    detached: !isWindows,
    shell: false,
  })

  if (typeof child.pid !== 'number') {
    consola.error('Failed to start child process')
    process.exit(1)
  }

  attachLifecycle(child, isWindows)
  return child
}

function attachLifecycle(child: ChildProcess, isWindows: boolean): void {
  let shuttingDown = false
  let killTimer: NodeJS.Timeout | null = null

  const killGroup = (signal: NodeJS.Signals): void => {
    try {
      if (isWindows) child.kill(signal)
      else if (typeof child.pid === 'number') process.kill(-child.pid, signal)
    } catch (err) {
      if (DEBUG) consola.warn(`kill(${signal}) failed: ${err}`)
    }
  }

  const onSignal = (signal: NodeJS.Signals): void => {
    if (shuttingDown) {
      killGroup('SIGKILL')
      process.exit(130)
    }
    shuttingDown = true
    if (DEBUG) consola.info(`Received ${signal}, forwarding to child...`)
    killGroup(signal)
    killTimer = setTimeout(() => {
      consola.warn('Child did not exit after 5s, sending SIGKILL')
      killGroup('SIGKILL')
    }, 5000)
  }

  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGHUP']
  for (const sig of signals) process.on(sig, () => onSignal(sig))

  child.on('exit', (code, signal) => {
    if (killTimer) clearTimeout(killTimer)
    if (code !== null) process.exit(code)
    if (signal) {
      const num = (os.constants.signals as Record<string, number>)[signal] ?? 0
      process.exit(128 + num)
    }
    process.exit(0)
  })

  child.on('error', (err) => {
    if (killTimer) clearTimeout(killTimer)
    consola.error(`Failed to spawn process: ${err.message}`)
    process.exit(1)
  })
}
