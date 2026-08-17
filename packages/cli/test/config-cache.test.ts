import { mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PkgService } from '../src/services'
import { clearConfigCache, loadShelveConfig } from '../src/utils/config'

let cwd: string
let sandbox: string
let savedToken: string | undefined
let savedSlug: string | undefined

beforeEach(() => {
  cwd = process.cwd()
  savedToken = process.env.SHELVE_TOKEN
  savedSlug = process.env.SHELVE_TEAM_SLUG
  delete process.env.SHELVE_TEAM_SLUG
  process.env.SHELVE_TOKEN = 'test-token'
  sandbox = realpathSync(mkdtempSync(join(tmpdir(), 'shelve-config-cache-')))
  process.chdir(sandbox)
  // Isolation between test *cases* below doesn't depend on this (each gets its
  // own sandbox dir, a fresh cache key), but between *files* it does: vitest
  // resets the module registry per file, so this mirrors that reset explicitly
  // rather than relying on it.
  clearConfigCache()
})

afterEach(() => {
  process.chdir(cwd)
  if (savedToken === undefined) delete process.env.SHELVE_TOKEN
  else process.env.SHELVE_TOKEN = savedToken
  if (savedSlug === undefined) delete process.env.SHELVE_TEAM_SLUG
  else process.env.SHELVE_TEAM_SLUG = savedSlug
  clearConfigCache()
  rmSync(sandbox, { recursive: true, force: true })
  vi.restoreAllMocks()
})

function writeShelveJson(project: string): void {
  writeFileSync(join(sandbox, 'shelve.json'), JSON.stringify({ project }))
}

describe('getDefaultConfig cache (loadShelveConfig, config.ts)', () => {
  it('skips PkgService.isMonorepo\'s repo-wide glob on a second call at the same cwd', async () => {
    writeShelveJson('demo')
    const spy = vi.spyOn(PkgService.prototype, 'isMonorepo')

    await loadShelveConfig()
    await loadShelveConfig()

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('re-runs the glob after clearConfigCache', async () => {
    writeShelveJson('demo')
    const spy = vi.spyOn(PkgService.prototype, 'isMonorepo')

    await loadShelveConfig()
    clearConfigCache()
    await loadShelveConfig()

    expect(spy).toHaveBeenCalledTimes(2)
  })

  // The dangerous case: if the whole of loadShelveConfig (not just the expensive
  // getDefaultConfig part) were cached by cwd, this would return the first
  // project instead of the second. shelve.json is read fresh on every call
  // regardless of the cache — see the comment on defaultConfigCache in config.ts.
  it('picks up a rewritten shelve.json without clearing the cache', async () => {
    writeShelveJson('first')
    const first = await loadShelveConfig()
    expect(first.project).toBe('first')

    writeShelveJson('second')
    const second = await loadShelveConfig()
    expect(second.project).toBe('second')
  })

  // Same danger, for an env var instead of a file: getEnvOverrides is called a
  // second time in loadShelveConfig, above the cached defaultConfig in the defu
  // merge, so a live SHELVE_TEAM_SLUG always wins even from a cached entry.
  it('picks up a changed SHELVE_TEAM_SLUG without clearing the cache', async () => {
    writeShelveJson('demo')
    process.env.SHELVE_TEAM_SLUG = 'team-a'
    const first = await loadShelveConfig()
    expect(first.slug).toBe('team-a')

    process.env.SHELVE_TEAM_SLUG = 'team-b'
    const second = await loadShelveConfig()
    expect(second.slug).toBe('team-b')
  })
})
