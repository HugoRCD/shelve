import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { ShelveConfig } from '@types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CliError } from '../src/services/api-error'
import { initCliContextFromArgv } from '../src/utils/cli-context'
import { withSpinner } from '../src/utils/output'
import { getWorkspaceTargets, runFanOutCommand, runInWorkspaces } from '../src/utils/workspaces'

let workspace: string
let cwd: string

function makeConfig(overrides: Partial<ShelveConfig> = {}): ShelveConfig {
  return {
    project: 'workspace-root',
    projectFromConfig: false,
    slug: 'team',
    token: 'token',
    url: 'https://app.shelve.cloud',
    confirmChanges: false,
    envFileName: '.env',
    autoUppercase: true,
    autoCreateProject: true,
    workspaceDir: workspace,
    isMonoRepo: true,
    isRoot: true,
    monorepo: { paths: [join(workspace, 'apps', 'web')] },
    ...overrides,
  }
}

beforeEach(() => {
  cwd = process.cwd()
  workspace = realpathSync(mkdtempSync(join(tmpdir(), 'shelve-workspaces-')))
  mkdirSync(join(workspace, 'apps', 'web'), { recursive: true })
  writeFileSync(join(workspace, 'apps', 'web', 'shelve.json'), JSON.stringify({ project: 'web-app' }))
  mkdirSync(join(workspace, 'apps', 'bare'), { recursive: true })
  process.chdir(workspace)
})

afterEach(() => {
  process.chdir(cwd)
  rmSync(workspace, { recursive: true, force: true })
})

describe('getWorkspaceTargets', () => {
  it('targets the configured packages at a monorepo root', () => {
    expect(getWorkspaceTargets(makeConfig())).toEqual([join(workspace, 'apps', 'web')])
  })

  it('stays put when the root declares its own project', () => {
    expect(getWorkspaceTargets(makeConfig({ projectFromConfig: true }))).toBeNull()
  })

  it('stays put inside a package', () => {
    expect(getWorkspaceTargets(makeConfig({ isRoot: false }))).toBeNull()
  })

  it('stays put outside a monorepo', () => {
    expect(getWorkspaceTargets(makeConfig({ isMonoRepo: false, monorepo: undefined }))).toBeNull()
  })

  it('stays put when no package carries a config', () => {
    expect(getWorkspaceTargets(makeConfig({ monorepo: { paths: [] } }))).toBeNull()
  })

  it('honours --path even when the root would not fan out', () => {
    const config = makeConfig({ projectFromConfig: true })
    expect(getWorkspaceTargets(config, 'apps/web')).toEqual([join(workspace, 'apps', 'web')])
  })

  it('rejects a --path without a Shelve config', () => {
    expect(() => getWorkspaceTargets(makeConfig(), 'apps/bare')).toThrow(CliError)
  })
})

describe('runInWorkspaces', () => {
  it('runs in each target and tags the result with its path', async () => {
    const seen: string[] = []
    const results = await runInWorkspaces([join(workspace, 'apps', 'web')], () => {
      seen.push(process.cwd())
      return Promise.resolve({ ok: true })
    })

    expect(seen).toEqual([join(workspace, 'apps', 'web')])
    expect(results).toEqual([{ ok: true, path: join('apps', 'web') }])
  })

  it('restores the working directory when a package fails', async () => {
    await expect(runInWorkspaces([join(workspace, 'apps', 'web')], () => {
      process.env.SHELVE_LEAK_PROBE = 'set-before-failure'
      return Promise.reject(new Error('boom'))
    })).rejects.toThrow('boom')

    expect(process.cwd()).toBe(workspace)
    expect(process.env.SHELVE_LEAK_PROBE).toBeUndefined()
  })

  it('does not leak a variable set in one target into the next, and restores the original environment', async () => {
    const originalEnv = { ...process.env }
    const seen: (string | undefined)[] = []

    await runInWorkspaces([join(workspace, 'apps', 'web'), join(workspace, 'apps', 'bare')], () => {
      seen.push(process.env.SHELVE_LEAK_PROBE)
      process.env.SHELVE_LEAK_PROBE = `leaked-from-${process.cwd()}`
      return Promise.resolve({ ok: true })
    })

    expect(seen).toEqual([undefined, undefined])
    expect(process.env).toEqual(originalEnv)
  })

  // Regression test for the bug this fixes: an error thrown by a service call
  // used to exit the process from inside withSpinner (see handleThrownError,
  // output.ts), which meant this catch — and the attribution/context it builds —
  // never ran for the common case (a 403/500 from the API). A plain `Error`
  // rejection, like the tests above use, never exercised that path at all.
  it('attributes a failure raised through withSpinner to its package, with structured context', async () => {
    const web = join(workspace, 'apps', 'web')
    const bare = join(workspace, 'apps', 'bare')

    await expect(runInWorkspaces([web, bare], () =>
      withSpinner('Fetch project', () => Promise.reject(new CliError('Forbidden', 'FORBIDDEN', 403))),
    )).rejects.toMatchObject({
      code: 'FORBIDDEN',
      status: 403,
      message: `${join('apps', 'web')}: Forbidden`,
      context: { failedPackage: join('apps', 'web'), completedPackages: [] },
    })
  })

  it('lists earlier packages as completed in the context when a later one fails', async () => {
    const web = join(workspace, 'apps', 'web')
    const bare = join(workspace, 'apps', 'bare')
    let call = 0

    await expect(runInWorkspaces([web, bare], () => {
      call += 1
      if (call === 1) return Promise.resolve({ ok: true })
      return withSpinner('Fetch project', () => Promise.reject(new CliError('Forbidden', 'FORBIDDEN', 403)))
    })).rejects.toMatchObject({
      context: { failedPackage: join('apps', 'bare'), completedPackages: [join('apps', 'web')] },
    })
  })
})

describe('runFanOutCommand', () => {
  afterEach(() => {
    initCliContextFromArgv(['node', 'shelve'])
  })

  it('runs the body once and reports through cliSuccess without a packages envelope outside a fan-out', async () => {
    initCliContextFromArgv(['node', 'shelve', '--json'])
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const config = makeConfig({ projectFromConfig: true })
    const calls: ShelveConfig[] = []

    await runFanOutCommand('pull', config, undefined, (cfg) => {
      calls.push(cfg)
      return Promise.resolve({ ok: true })
    })

    expect(calls).toEqual([config])
    expect(log).toHaveBeenCalledWith(JSON.stringify({ ok: true, command: 'pull', data: { ok: true } }))
    log.mockRestore()
  })

  it('fans out and reloads each package\'s own config for the body', async () => {
    const pkg = join(workspace, 'apps', 'web')
    writeFileSync(join(pkg, 'shelve.json'), JSON.stringify({ project: 'web-app', slug: 'team' }))
    process.env.SHELVE_TOKEN = 'test-token'

    try {
      const config = makeConfig()
      const seenProjects: string[] = []

      await runFanOutCommand('push', config, undefined, (cfg) => {
        seenProjects.push(cfg.project)
        return Promise.resolve({ ok: true })
      })

      expect(seenProjects).toEqual(['web-app'])
    } finally {
      delete process.env.SHELVE_TOKEN
    }
  })
})
