import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { initCliContextFromArgv } from '../src/utils/cli-context'
import { clearConfigCache, findConfigFile, loadShelveConfig } from '../src/utils/config'

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
  // Each test gets its own mkdtemp dir, so this cache is a no-op cache miss by
  // construction — but clearing it here means that stays true even if a future
  // test reuses a cwd, instead of depending on every temp dir being unique forever.
  clearConfigCache()
})

afterEach(() => {
  process.chdir(cwd)
  for (const [key, value] of Object.entries(savedEnv)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  clearConfigCache()
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

  it('falls back to the package\'s own package.json name when only the root declares a project', async () => {
    createWorkspace({ slug: 'team', project: 'root-project' }, { defaultEnv: 'development' })
    process.chdir(join(workspace, 'apps', 'web'))

    const config = await loadShelveConfig()

    // `project` is per-package identity: a root-declared project must not leak
    // into a package that never set its own, or `shelve push` there would upload
    // to the root's project instead of the package's own (issue #712-style report).
    expect(config.project).toBe('web')
    expect(config.projectFromConfig).toBe(false)
  })

  it('lists only the packages that carry their own config', async () => {
    createWorkspace({ slug: 'team' }, { project: 'web-app' })
    // a package without a Shelve config, and one nested in node_modules
    mkdirSync(join(workspace, 'packages', 'core'), { recursive: true })
    writeFileSync(join(workspace, 'packages', 'core', 'package.json'), JSON.stringify({ name: 'core' }))
    mkdirSync(join(workspace, 'node_modules', 'vendor'), { recursive: true })
    writeFileSync(join(workspace, 'node_modules', 'vendor', 'shelve.json'), JSON.stringify({ project: 'vendor' }))
    // build output, which should never become a fan-out target
    mkdirSync(join(workspace, 'apps', 'web', 'dist'), { recursive: true })
    writeFileSync(join(workspace, 'apps', 'web', 'dist', 'shelve.json'), JSON.stringify({ project: 'built' }))
    process.chdir(workspace)

    const config = await loadShelveConfig()

    expect(config.monorepo?.paths).toEqual([join(workspace, 'apps', 'web')])
  })

  it('keeps the root\'s own project when running at the workspace root', async () => {
    createWorkspace({ slug: 'team', project: 'root-project' }, { project: 'web-app' })
    process.chdir(workspace)

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

  it('lets an environment variable override a committed root config', async () => {
    createWorkspace({ slug: 'root-team' }, { project: 'web-app' })
    process.chdir(join(workspace, 'apps', 'web'))
    process.env.SHELVE_TEAM_SLUG = 'env-team'

    const config = await loadShelveConfig()

    expect(config.slug).toBe('env-team')
  })

  it('lets the local config override an environment variable', async () => {
    createWorkspace({ slug: 'root-team' }, { project: 'web-app', slug: 'local-team' })
    process.chdir(join(workspace, 'apps', 'web'))
    process.env.SHELVE_TEAM_SLUG = 'env-team'

    const config = await loadShelveConfig()

    expect(config.slug).toBe('local-team')
  })

  it('does not auto-create a root project on a first run at a monorepo root', async () => {
    // root has no shelve.json yet, only the package does
    writeFileSync(join(workspace, 'package.json'), JSON.stringify({ name: 'workspace-root', private: true }))
    writeFileSync(join(workspace, 'pnpm-workspace.yaml'), 'packages:\n  - apps/*\n')
    const pkg = join(workspace, 'apps', 'web')
    mkdirSync(pkg, { recursive: true })
    writeFileSync(join(pkg, 'package.json'), JSON.stringify({ name: 'web' }))
    writeFileSync(join(pkg, 'shelve.json'), JSON.stringify({ project: 'web-app', slug: 'team' }))
    process.chdir(workspace)

    const config = await loadShelveConfig(true)

    expect(findConfigFile(workspace)).toBeNull()
    expect(config.monorepo?.paths).toEqual([pkg])
  })

  it('still validates a monorepo root that declares its own project', async () => {
    // no slug anywhere: this must fail validation rather than being waved through
    // as a fan-out run, which is what a root-declared `project` looks like before
    // the merge (see the projectFromConfig note on loadShelveConfig's fan-out gate)
    createWorkspace({ project: 'root-app' }, { project: 'web-app', slug: 'team' })
    process.chdir(workspace)
    process.env.SHELVE_TOKEN = 'test-token'
    initCliContextFromArgv(['node', 'shelve', 'pull', '--non-interactive'])

    try {
      await expect(loadShelveConfig(true)).rejects.toThrow(/slug/i)
    } finally {
      delete process.env.SHELVE_TOKEN
      initCliContextFromArgv(['node', 'shelve'])
    }
  })
})
