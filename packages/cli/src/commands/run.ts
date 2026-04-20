import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import * as os from 'node:os'
import { defineCommand } from 'citty'
import { intro, log } from '@clack/prompts'
import type { EnvVarExport, Project, Environment } from '@types'
import consola from 'consola'
import {
  handleCancel,
  loadShelveConfig,
  loadTemplate,
  parseDuration,
  resolveReferences,
  type ParsedTemplate,
} from '../utils'
import {
  CacheService,
  EnvironmentService,
  EnvService,
  ProjectService,
  type CacheKeyInput,
} from '../services'
import { DEBUG } from '../constants'

const DEFAULT_CACHE_TTL_MS = 24 * 60 * 60 * 1000
const WATCH_POLL_MS = 5_000

type RunArgs = {
  env?: string
  template?: string
  offline?: boolean
  noCache?: boolean
  cacheTtl?: string
  watch?: boolean
  restartOnChange?: boolean
}

export default defineCommand({
  meta: {
    name: 'run',
    description: 'Inject secrets from Shelve into your application process (no .env on disk).',
  },
  args: {
    env: {
      type: 'string',
      description: 'environment to use',
      required: false,
    },
    template: {
      type: 'string',
      description: 'path to a `.env.template` file containing `shelve://` references and literals to merge',
      required: false,
    },
    offline: {
      type: 'boolean',
      description: 'use only the encrypted offline cache; never call the API',
      required: false,
    },
    'no-cache': {
      type: 'boolean',
      description: 'disable both cache reads and writes',
      required: false,
    },
    'cache-ttl': {
      type: 'string',
      description: 'override cache freshness (e.g. `15m`, `2h`, `1d`). Default: 24h.',
      required: false,
    },
    watch: {
      type: 'boolean',
      description: 'poll Shelve for variable updates and forward SIGHUP to the child on change',
      required: false,
    },
    'restart-on-change': {
      type: 'boolean',
      description: 'in --watch mode, kill the child and respawn instead of sending SIGHUP',
      required: false,
    },
  },
  async run({ args, rawArgs }) {
    const argv = parseRawArgs(rawArgs)
    if (argv.length === 0) {
      handleCancel('You must provide a command to run, e.g. `shelve run -- pnpm dev`')
    }

    const { project, slug, autoCreateProject, defaultEnv, url, token } = await loadShelveConfig(true)
    const runArgs = normalizeArgs(args)

    const offlineOnly = runArgs.offline === true
    const noCache = runArgs.noCache === true
    const cacheTtl = parseDuration(runArgs.cacheTtl, DEFAULT_CACHE_TTL_MS)

    intro(`Loading secrets for ${project} (${runArgs.env || defaultEnv})`)

    const template = runArgs.template ? loadTemplateOrExit(runArgs.template) : null

    let projectData: Project | null = null
    let environment: Environment | null = null
    const envName = runArgs.env || defaultEnv
    const cacheInput = (env: string): CacheKeyInput => ({
      url,
      teamSlug: slug,
      projectName: project,
      environmentName: env,
    })

    let variables: EnvVarExport[]

    if (offlineOnly) {
      const cached = token ? CacheService.read(cacheInput(envName), token, 0) : null
      if (!cached) handleCancel('Offline cache not found for this project/environment.')
      variables = cached!
      log.info('Using offline cache (network skipped).')
    } else {
      try {
        projectData = await ProjectService.getProjectByName(project, slug, autoCreateProject)
        environment = await EnvironmentService.getEnvironment(slug, envName)
        variables = await EnvService.getEnvVariables({
          project: projectData,
          environmentId: environment.id,
          slug,
        })
        if (!noCache && token) CacheService.write(cacheInput(envName), token, variables)
      } catch (err) {
        if (noCache) throw err
        const cached = token ? CacheService.read(cacheInput(envName), token, cacheTtl) : null
        if (!cached) throw err
        log.warn('Failed to fetch from Shelve; falling back to encrypted cache.')
        variables = cached
      }
    }

    const secretEnv = buildEnv(variables, template, envName)

    let child = spawnChild(argv, secretEnv)

    if (runArgs.watch) {
      if (!projectData || !environment) {
        log.warn('Watch mode requires a successful API connection on startup; ignoring --watch.')
      } else {
        startWatch({
          projectData,
          environment,
          slug,
          envName,
          token,
          noCache,
          cacheTtl,
          cacheInput,
          template,
          restartOnChange: runArgs.restartOnChange === true,
          getChild: () => child,
          spawnNew: (env) => {
            child = spawnChild(argv, env)
            return child
          },
        })
      }
    }
  },
})

function loadTemplateOrExit(path: string): ParsedTemplate {
  const tpl = loadTemplate(path)
  if (!tpl) handleCancel(`Template not found: ${path}`)
  return tpl!
}

function normalizeArgs(args: Record<string, unknown>): RunArgs {
  return {
    env: typeof args.env === 'string' ? args.env : undefined,
    template: typeof args.template === 'string' ? args.template : undefined,
    offline: args.offline === true,
    noCache: args['no-cache'] === true || args.noCache === true,
    cacheTtl: typeof args['cache-ttl'] === 'string' ? args['cache-ttl'] as string : undefined,
    watch: args.watch === true,
    restartOnChange: args['restart-on-change'] === true || args.restartOnChange === true,
  }
}

function buildEnv(
  variables: EnvVarExport[],
  template: ParsedTemplate | null,
  envName: string
): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env }

  if (!template) {
    for (const { key, value } of variables) env[key] = value
    return env
  }

  const { resolved, missing } = resolveReferences(template, variables, envName)
  for (const { key, value } of resolved) env[key] = value
  if (missing.length > 0) {
    log.warn(
      `Unresolved secret references (still rendered as the literal placeholder): ${missing.map(m => m.key).join(', ')}`
    )
  }
  return env
}

function parseRawArgs(rawArgs: string[]): string[] {
  const sepIdx = rawArgs.indexOf('--')
  if (sepIdx >= 0) return rawArgs.slice(sepIdx + 1)
  return rawArgs.filter((arg) => !arg.startsWith('-'))
}

function resolveCommand(argv: string[]): { bin: string; argv: string[] } {
  if (argv.length === 0) throw new Error('Empty command')

  const localNr = resolve(process.cwd(), 'node_modules/.bin/nr')
  if (existsSync(localNr) && argv.length === 1 && !argv[0]!.includes(' ')) {
    return { bin: localNr, argv }
  }

  return { bin: argv[0]!, argv: argv.slice(1) }
}

function spawnChild(rawArgv: string[], env: NodeJS.ProcessEnv): ChildProcess {
  const { bin, argv } = resolveCommand(rawArgv)
  const isWindows = process.platform === 'win32'

  const child = spawn(bin, argv, {
    env,
    stdio: 'inherit',
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

type WatchOpts = {
  projectData: Project
  environment: Environment
  slug: string
  envName: string
  token: string | undefined
  noCache: boolean
  cacheTtl: number
  cacheInput: (env: string) => CacheKeyInput
  template: ParsedTemplate | null
  restartOnChange: boolean
  getChild: () => ChildProcess
  spawnNew: (env: NodeJS.ProcessEnv) => Promise<ChildProcess>
}

function fingerprint(variables: EnvVarExport[]): string {
  return variables
    .map(v => `${v.key}=${v.value}`)
    .sort()
    .join('\n')
}

function startWatch(opts: WatchOpts): void {
  let lastPrint = fingerprint([])
  let inFlight = false

  const tick = async (): Promise<void> => {
    if (inFlight) return
    inFlight = true
    try {
      const next = await EnvService.getEnvVariables({
        project: opts.projectData,
        environmentId: opts.environment.id,
        slug: opts.slug,
      })
      const fp = fingerprint(next)
      if (lastPrint && fp !== lastPrint) {
        log.info('Variables changed — reloading child process.')
        if (!opts.noCache && opts.token) {
          CacheService.write(opts.cacheInput(opts.envName), opts.token, next)
        }
        const env = buildEnv(next, opts.template, opts.envName)
        if (opts.restartOnChange) {
          const child = opts.getChild()
          if (child.pid && process.platform !== 'win32') {
            try { process.kill(-child.pid, 'SIGTERM') } catch { /* ignore */ }
          } else {
            child.kill('SIGTERM')
          }
          await opts.spawnNew(env)
        } else {
          const child = opts.getChild()
          try {
            if (child.pid && process.platform !== 'win32') process.kill(-child.pid, 'SIGHUP')
            else child.kill('SIGHUP')
          } catch (err) {
            if (DEBUG) consola.warn(`Failed to send SIGHUP: ${err}`)
          }
        }
      }
      lastPrint = fp
    } catch (err) {
      if (DEBUG) consola.warn(`Watch poll failed: ${err}`)
    } finally {
      inFlight = false
    }
  }

  const interval = setInterval(tick, WATCH_POLL_MS)
  process.on('exit', () => clearInterval(interval))
  void tick()
}
