import { isAbsolute, relative, resolve } from 'path'
import type { ShelveConfig } from '@types'
import { CliError, toCliError } from '../services/api-error'
import { clearConfigCache, findConfigFile, loadShelveConfig } from './config'
import { cliInfo, cliSuccess } from './output'

export type WorkspaceResult<T> = T & { path: string }

/**
 * Puts process.env back to a snapshot without replacing the object itself,
 * since `process.env = snapshot` swaps out Node's env-backed object for a
 * plain one and loses the coercion it does on values written afterwards.
 *
 * @param snapshot - The environment to restore
 */
function resetEnv(snapshot: NodeJS.ProcessEnv): void {
  for (const key of Object.keys(process.env)) {
    if (!(key in snapshot)) delete process.env[key]
  }
  Object.assign(process.env, snapshot)
}

/**
 * Decides which directories a command should run in.
 *
 * A monorepo root has no project of its own: `project` there falls back to the
 * workspace name from package.json, which is how a root-level `shelve pull`
 * ends up talking to a project nobody created. When that is the situation, the
 * command runs once per package that has its own config instead.
 *
 * @param config - The merged configuration for the current directory
 * @param path - Value of --path, when the user targeted a single package
 * @returns Directories to run in, or null to run once in the current directory
 */
export function getWorkspaceTargets(config: ShelveConfig, path?: string): string[] | null {
  if (path) {
    const dir = isAbsolute(path) ? path : resolve(process.cwd(), path)
    if (!findConfigFile(dir)) {
      throw new CliError(
        `No Shelve configuration in ${path}.`,
        'INVALID_INPUT',
        undefined,
        'Pass --path a directory holding a shelve.json.',
      )
    }
    return [dir]
  }

  if (!config.isMonoRepo || !config.isRoot || config.projectFromConfig) return null

  const paths = config.monorepo?.paths ?? []
  return paths.length > 0 ? paths : null
}

/**
 * Runs a command body once per target directory.
 *
 * Commands resolve their config file, their env file and their project name
 * from the working directory, so moving the process is what makes a package the
 * subject of the command. The original directory is restored even if a package
 * fails, which keeps a partial run from stranding the process somewhere else.
 *
 * loadShelveConfig's setupDotenv call mutates process.env in place and only
 * ever adds to it, so without a reset a variable from one package's .env would
 * still be set once the next package's config is resolved. Restoring goes
 * through resetEnv rather than `process.env = snapshot`, because reassigning
 * the object swaps out Node's env-backed object for a plain one and silently
 * drops the string coercion it applies to values written afterwards.
 *
 * A failing package stops the run. Earlier packages have already written to
 * disk by then, so the error names them rather than leaving the caller to guess
 * how far it got, both in the hint's prose and in a structured `context` field
 * ({ failedPackage, completedPackages }) for a --json consumer.
 *
 * clearConfigCache runs alongside every resetEnv: loadShelveConfig's cache is
 * keyed on process.cwd() (see config.ts), and SHELVE_TOKEN is the one input it
 * reads that nothing re-checks fresh afterwards (unlike the other SHELVE_* vars,
 * which loadShelveConfig re-applies live on every call). Dropping the cache in
 * step with the env reset means a package's own .env can never hand the next
 * package a stale token pulled from cache.
 *
 * @param targets - Absolute directories to run in
 * @param run - The command body, invoked once per target
 * @returns One result per target, tagged with its path relative to the start
 */
export async function runInWorkspaces<T extends object>(
  targets: string[],
  run: () => Promise<T>,
): Promise<WorkspaceResult<T>[]> {
  const cwd = process.cwd()
  const env = { ...process.env }
  const results: WorkspaceResult<T>[] = []
  let current = ''

  try {
    for (const dir of targets) {
      resetEnv(env)
      clearConfigCache()
      current = relative(cwd, dir) || '.'
      cliInfo(`→ ${current}`)
      process.chdir(dir)
      results.push({ ...await run(), path: current })
    }
  } catch (error) {
    const done = results.map(result => result.path)
    const failure = toCliError(error)
    throw new CliError(
      `${current}: ${failure.message}`,
      failure.code,
      failure.status,
      [
        failure.hint,
        done.length > 0 ? `Already completed: ${done.join(', ')}.` : 'No package completed.',
      ].filter(Boolean).join(' '),
      { failedPackage: current, completedPackages: done },
    )
  } finally {
    process.chdir(cwd)
    resetEnv(env)
    clearConfigCache()
  }

  return results
}

const FAN_OUT_VERBS = {
  pull: 'Pulled',
  push: 'Pushed',
  diff: 'Diffed',
  sync: 'Synced',
} as const

/**
 * Shared tail for pull/push/diff/sync: resolve fan-out targets, run the command
 * body once (single project) or once per package (monorepo fan-out), and report
 * through cliSuccess with the same `packages` envelope either way. The four
 * commands used to copy this by hand, which is how they'd drift apart on that
 * shape — one copy keeps them in step.
 *
 * @param name - Command name; picks the past-tense verb below and is passed to cliSuccess as-is
 * @param config - The already-loaded root configuration
 * @param path - Value of --path, when the user targeted a single package
 * @param body - The command's per-project logic, given that project's config
 */
export async function runFanOutCommand<T extends object>(
  name: keyof typeof FAN_OUT_VERBS,
  config: ShelveConfig,
  path: string | undefined,
  body: (config: ShelveConfig) => Promise<T>,
): Promise<void> {
  const targets = getWorkspaceTargets(config, path)

  if (!targets) {
    cliSuccess(await body(config), undefined, name)
    return
  }

  const packages = await runInWorkspaces(targets, async () => body(await loadShelveConfig(true)))

  cliSuccess(
    { packages },
    `${FAN_OUT_VERBS[name]} ${packages.length} package(s): ${packages.map(p => p.path).join(', ')}`,
    name,
  )
}
