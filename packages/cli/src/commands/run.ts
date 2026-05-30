import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import * as os from 'node:os'
import { defineCommand } from 'citty'
import type { EnvVarExport, Project, Environment } from '@types'
import consola from 'consola'
import { readPackageJSON } from 'pkg-types'
import treeKill from 'tree-kill'
import {
  cliError,
  cliInfo,
  cliIntro,
  cliWarn,
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
import { debugLog } from '../constants'
import { formatCliError, toCliError } from '../services/api-error'

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

    cliIntro(`Loading secrets for ${project} (${runArgs.env || defaultEnv})`)

    const template = runArgs.template ? loadTemplateOrExit(runArgs.template) : null

    let projectData: Project | null = null
    let environment: Environment | null = null
    const envName = runArgs.env || defaultEnv
    if (!envName) handleCancel('No environment specified. Pass --env or set `defaultEnv` in shelve.json.')
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
      cliInfo('Using offline cache (network skipped).')
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
        if (noCache) {
          const apiError = toCliError(err, 'FETCH_FAILED')
          cliError({
            code: apiError.code,
            message: formatCliError(err, 'Failed to fetch secrets from Shelve'),
            status: apiError.status,
          })
        }
        const cached = token ? CacheService.read(cacheInput(envName), token, cacheTtl) : null
        if (!cached) {
          const apiError = toCliError(err, 'FETCH_FAILED')
          cliError({
            code: apiError.code,
            message: formatCliError(err, 'Failed to fetch secrets from Shelve and no offline cache is available'),
            status: apiError.status,
            hint: 'Run `shelve pull` once while online, or pass --offline when a cache exists.',
          })
        }
        cliWarn('Failed to fetch from Shelve; falling back to encrypted cache.')
        variables = cached
      }
    }

    const secretEnv = buildEnv(variables, template, envName)

    let child = await spawnChild(argv, secretEnv)

    watchParentLiveness((sig) => {
      debugLog(`Parent process gone — tearing down child tree`)
      if (typeof child.pid === 'number') killTree(child.pid, sig)
      setTimeout(() => process.exit(129), 1500).unref()
    })

    if (runArgs.watch) {
      if (!projectData || !environment) {
        cliWarn('Watch mode requires a successful API connection on startup; ignoring --watch.')
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
          spawnNew: async (env) => {
            child = await spawnChild(argv, env)
            return child
          },
        })
      }
    }

    await new Promise<never>(() => {})
  },
})

type ChildWithFlag = ChildProcess & { __restarting?: boolean }

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
    cliWarn(
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

type SpawnTarget = { bin: string; argv: string[] }

/** Run the package.json script body via the system shell (same as npm/pnpm would, without the PM wrapper that prints ELIFECYCLE on SIGINT). */
function resolveDirectScriptSpawn(scriptBody: string): SpawnTarget {
  if (IS_WINDOWS) {
    return { bin: 'cmd.exe', argv: ['/d', '/s', '/c', scriptBody] }
  }
  return { bin: 'sh', argv: ['-c', scriptBody] }
}

async function resolveCommandWithScripts(argv: string[]): Promise<SpawnTarget> {
  if (argv.length === 1 && !argv[0]!.includes('/') && !argv[0]!.includes(' ')) {
    const script = argv[0]!
    const pkg = await readPackageJSON().catch(() => null)
    const scriptBody = pkg?.scripts?.[script]
    if (scriptBody) {
      debugLog(`Resolved script "${script}" → ${scriptBody} (direct)`)
      return resolveDirectScriptSpawn(scriptBody)
    }
    if (pkg) {
      debugLog(`No script "${script}" in package.json; treating as a literal binary`)
    }
  }

  return resolveCommand(argv)
}

const IS_WINDOWS = process.platform === 'win32'

/** Exit codes produced when the user interrupts (SIGINT=130, SIGTERM=143, SIGHUP=129). */
function isSignalExitCode(code: number | null): boolean {
  return code === 130 || code === 143 || code === 129
}

function exitFromChild(code: number | null, signal: NodeJS.Signals | null): void {
  if (parentSignalShuttingDown || isSignalExitCode(code)) {
    process.exit(0)
  }
  if (code !== null) process.exit(code)
  if (signal) {
    const num = (os.constants.signals as Record<string, number>)[signal] ?? 0
    process.exit(128 + num)
  }
  process.exit(0)
}
const PARENT_WATCH_INTERVAL_MS = 2_000

function killTree(pid: number, signal: NodeJS.Signals = 'SIGTERM'): void {
  treeKill(pid, signal, (err) => {
    if (err) debugLog(`tree-kill ${signal} pid=${pid} failed`, err)
  })
}

let currentChild: ChildProcess | null = null
let signalHandlersInstalled = false
let parentSignalShuttingDown = false
let parentSignalKillTimer: ReturnType<typeof setTimeout> | null = null

function ensureSignalHandlers(): void {
  if (signalHandlersInstalled) return
  signalHandlersInstalled = true
  const onSignal = (sig: NodeJS.Signals, exitCode: number): void => {
    if (parentSignalShuttingDown) {
      if (currentChild?.pid) killTree(currentChild.pid, 'SIGKILL')
      process.exit(exitCode)
    }
    parentSignalShuttingDown = true
    debugLog(`Received ${sig}, forwarding to child tree`)
    if (currentChild?.pid) killTree(currentChild.pid, sig)
    parentSignalKillTimer = setTimeout(() => {
      consola.warn('Child did not exit after 5s, sending SIGKILL')
      if (currentChild?.pid) killTree(currentChild.pid, 'SIGKILL')
      setTimeout(() => process.exit(exitCode), 500).unref()
    }, 5000)
  }
  process.on('SIGINT', () => onSignal('SIGINT', 130))
  process.on('SIGTERM', () => onSignal('SIGTERM', 143))
  process.on('SIGHUP', () => onSignal('SIGHUP', 129))
}

function watchParentLiveness(onParentGone: (sig: NodeJS.Signals) => void): void {
  const parentPid = process.ppid
  if (!parentPid || parentPid === 1) return
  const initial = parentPid
  const timer = setInterval(() => {
    try {
      process.kill(initial, 0)
      if (!IS_WINDOWS && process.ppid !== initial) {
        debugLog(`Parent pid changed (${initial} → ${process.ppid}); treating as parent death`)
        clearInterval(timer)
        onParentGone('SIGTERM')
      }
    } catch {
      clearInterval(timer)
      onParentGone('SIGTERM')
    }
  }, PARENT_WATCH_INTERVAL_MS)
  timer.unref()
}

async function spawnChild(rawArgv: string[], env: NodeJS.ProcessEnv): Promise<ChildProcess> {
  const { bin, argv } = await resolveCommandWithScripts(rawArgv)
  debugLog(`Spawning: ${bin} ${argv.join(' ')}`)

  const child = spawn(bin, argv, {
    env,
    stdio: 'inherit',
    shell: false,
    windowsHide: true,
  })

  if (typeof child.pid !== 'number') {
    const hint = rawArgv.length === 1
      ? `Try \`shelve run -- pnpm ${rawArgv[0]}\` or ensure the command is on your PATH.`
      : `Try \`shelve run -- ${rawArgv.join(' ')}\`.`
    consola.error(`Failed to start child process "${bin}". ${hint}`)
    process.exit(1)
  }

  attachLifecycle(child)
  return child
}

const QUICK_EXIT_THRESHOLD_MS = 250

function attachLifecycle(child: ChildProcess): void {
  ensureSignalHandlers()
  currentChild = child
  const spawnedAt = Date.now()

  child.on('exit', (code, signal) => {
    if (parentSignalKillTimer) {
      clearTimeout(parentSignalKillTimer)
      parentSignalKillTimer = null
    }
    if ((child as ChildWithFlag).__restarting) return
    const elapsed = Date.now() - spawnedAt
    if (!parentSignalShuttingDown && code === 0 && elapsed < QUICK_EXIT_THRESHOLD_MS) {
      consola.warn(
        `Child exited cleanly after ${elapsed}ms — that's suspiciously fast. `
        + `Run \`shelve run … --debug\` to see the resolved command. `
        + `If you're invoking a script name (e.g. \`shelve run dev\`), try \`shelve run -- pnpm dev\` to bypass script resolution.`
      )
    }
    exitFromChild(code, signal)
  })

  child.on('error', (err) => {
    if (parentSignalKillTimer) {
      clearTimeout(parentSignalKillTimer)
      parentSignalKillTimer = null
    }
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
  spawnNew: (env: NodeJS.ProcessEnv) => ChildProcess | Promise<ChildProcess>
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
        quiet: true,
      })
      const fp = fingerprint(next)
      if (lastPrint && fp !== lastPrint) {
        cliInfo('Variables changed — reloading child process.')
        if (!opts.noCache && opts.token) {
          CacheService.write(opts.cacheInput(opts.envName), opts.token, next)
        }
        const env = buildEnv(next, opts.template, opts.envName)
        if (opts.restartOnChange) {
          const old = opts.getChild() as ChildWithFlag
          old.__restarting = true
          if (typeof old.pid === 'number') killTree(old.pid, 'SIGTERM')
          await opts.spawnNew(env)
        } else {
          const child = opts.getChild()
          if (typeof child.pid === 'number') killTree(child.pid, 'SIGHUP')
        }
      }
      lastPrint = fp
    } catch (err) {
      debugLog('Watch poll failed', err)
    } finally {
      inFlight = false
    }
  }

  const interval = setInterval(tick, WATCH_POLL_MS)
  process.on('exit', () => clearInterval(interval))
  void tick()
}
