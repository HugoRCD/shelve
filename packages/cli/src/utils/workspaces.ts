import { isAbsolute, relative, resolve } from 'path'
import type { ShelveConfig } from '@types'
import { CliError } from '../services/api-error'
import { findConfigFile } from './config'
import { cliInfo } from './output'

export type WorkspaceResult<T> = T & { path: string }

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
 * @param targets - Absolute directories to run in
 * @param run - The command body, invoked once per target
 * @returns One result per target, tagged with its path relative to the start
 */
export async function runInWorkspaces<T extends object>(
  targets: string[],
  run: () => Promise<T>,
): Promise<WorkspaceResult<T>[]> {
  const cwd = process.cwd()
  const results: WorkspaceResult<T>[] = []

  try {
    for (const dir of targets) {
      const path = relative(cwd, dir) || '.'
      cliInfo(`→ ${path}`)
      process.chdir(dir)
      results.push({ ...await run(), path })
    }
  } finally {
    process.chdir(cwd)
  }

  return results
}
