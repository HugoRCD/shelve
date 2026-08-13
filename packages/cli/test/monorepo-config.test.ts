import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { loadShelveConfig } from '../src/utils/config'

const SHELVE_ENV_KEYS = ['SHELVE_PROJECT', 'SHELVE_TEAM_SLUG', 'SHELVE_DEFAULT_ENV', 'SHELVE_URL']

let workspace: string
let cwd: string
let savedEnv: Record<string, string | undefined>

/**
 * Builds a two-package workspace: a root that owns the shared config and one
 * package under apps/web. pnpm-workspace.yaml is what makes findWorkspaceDir
 * treat the temp directory as the root.
 */
function createWorkspace(rootConfig: object, packageConfig: object): void {
  writeFileSync(join(workspace, 'package.json'), JSON.stringify({ name: 'workspace-root', private: true }))
  writeFileSync(join(workspace, 'pnpm-workspace.yaml'), 'packages:\n  - apps/*\n')
  writeFileSync(join(workspace, 'shelve.json'), JSON.stringify(rootConfig))

  const pkg = join(workspace, 'apps', 'web')
  mkdirSync(pkg, { recursive: true })
  writeFileSync(join(pkg, 'package.json'), JSON.stringify({ name: 'web' }))
  writeFileSync(join(pkg, 'shelve.json'), JSON.stringify(packageConfig))
}

beforeEach(() => {
  cwd = process.cwd()
  savedEnv = Object.fromEntries(SHELVE_ENV_KEYS.map((key) => [key, process.env[key]]))
  for (const key of SHELVE_ENV_KEYS) delete process.env[key]
  // realpath because macOS resolves the temp dir through a symlink, which would
  // break the workspaceDir === cwd comparison behind `isRoot`
  workspace = realpathSync(mkdtempSync(join(tmpdir(), 'shelve-monorepo-')))
})

afterEach(() => {
  process.chdir(cwd)
  for (const [key, value] of Object.entries(savedEnv)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  rmSync(workspace, { recursive: true, force: true })
})

describe('monorepo config resolution', () => {
  it('inherits shared settings from the root config', async () => {
    createWorkspace(
      { slug: 'team', envFileName: '.env.root', autoCreateProject: false },
      { project: 'web-app' },
    )
    process.chdir(join(workspace, 'apps', 'web'))

    const config = await loadShelveConfig()

    expect(config.slug).toBe('team')
    expect(config.envFileName).toBe('.env.root')
    expect(config.autoCreateProject).toBe(false)
  })

  it('lets the package config override the root config', async () => {
    createWorkspace({ slug: 'team', envFileName: '.env.root' }, { project: 'web-app', envFileName: '.env.local' })
    process.chdir(join(workspace, 'apps', 'web'))

    const config = await loadShelveConfig()

    expect(config.envFileName).toBe('.env.local')
  })

  it('prefers a root-declared project over the package.json name', async () => {
    createWorkspace({ slug: 'team', project: 'root-project' }, { defaultEnv: 'development' })
    process.chdir(join(workspace, 'apps', 'web'))

    const config = await loadShelveConfig()

    expect(config.project).toBe('root-project')
    expect(config.projectFromConfig).toBe(true)
  })

  it('flags a project inferred from package.json at the workspace root', async () => {
    createWorkspace({ slug: 'team' }, { project: 'web-app' })
    process.chdir(workspace)

    const config = await loadShelveConfig()

    expect(config.isRoot).toBe(true)
    expect(config.project).toBe('workspace-root')
    expect(config.projectFromConfig).toBe(false)
  })
})
