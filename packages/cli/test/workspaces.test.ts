import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { ShelveConfig } from '@types'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { CliError } from '../src/services/api-error'
import { getWorkspaceTargets, runInWorkspaces } from '../src/utils/workspaces'

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
      return Promise.reject(new Error('boom'))
    })).rejects.toThrow('boom')

    expect(process.cwd()).toBe(workspace)
  })
})
