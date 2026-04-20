import { mkdtempSync, readFileSync, writeFileSync, rmSync, utimesSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CacheKeyInput } from '../src/services/cache'

type CacheModule = typeof import('../src/services/cache')

// `src/services/cache.ts` captures `homedir()` and `CACHE_DIR` at module load
// time. We therefore need to mutate HOME and then dynamically import the
// module so the cache lands under the test sandbox instead of the real user
// home directory.
describe('CacheService', () => {
  const originalHome = process.env.HOME
  const originalUserProfile = process.env.USERPROFILE
  let sandbox: string
  let cache: CacheModule

  const input: CacheKeyInput = {
    url: 'https://shelve.cloud',
    teamSlug: 'acme',
    projectName: 'web',
    environmentName: 'production',
  }
  const token = 'she_live_'.concat('a'.repeat(40))
  const variables = [
    { key: 'DATABASE_URL', value: 'postgres://prod' },
    { key: 'API_KEY', value: 'sk-abc' },
  ]

  beforeEach(async () => {
    sandbox = mkdtempSync(join(tmpdir(), 'shelve-cache-'))
    process.env.HOME = sandbox
    process.env.USERPROFILE = sandbox
    vi.resetModules()
    cache = await import('../src/services/cache')
  })

  afterEach(() => {
    rmSync(sandbox, { recursive: true, force: true })
    process.env.HOME = originalHome
    process.env.USERPROFILE = originalUserProfile
  })

  it('writes and reads back variables with the same token', () => {
    cache.CacheService.write(input, token, variables)
    const read = cache.CacheService.read(input, token, 60_000)
    expect(read).toEqual(variables)
  })

  it('returns null when the file does not exist', () => {
    expect(cache.CacheService.read(input, token, 60_000)).toBeNull()
  })

  it('refuses to write without a token', () => {
    cache.CacheService.write(input, '', variables)
    expect(cache.CacheService.read(input, token, 60_000)).toBeNull()
  })

  it('returns null when reading without a token', () => {
    cache.CacheService.write(input, token, variables)
    expect(cache.CacheService.read(input, '', 60_000)).toBeNull()
  })

  it('fails decryption (returns null) when the token changes', () => {
    cache.CacheService.write(input, token, variables)
    const tampered = cache.CacheService.read(input, 'she_live_'.concat('b'.repeat(40)), 60_000)
    expect(tampered).toBeNull()
  })

  it('respects TTL: stale entries are not returned', () => {
    cache.CacheService.write(input, token, variables)
    const file = cache.cacheFilePath(input)
    const past = (Date.now() - 60 * 60 * 1000) / 1000
    utimesSync(file, past, past)
    expect(cache.CacheService.read(input, token, 60_000)).toBeNull()
  })

  it('returns the payload when ttlMs is 0 (no expiry)', () => {
    cache.CacheService.write(input, token, variables)
    const file = cache.cacheFilePath(input)
    const past = (Date.now() - 365 * 24 * 60 * 60 * 1000) / 1000
    utimesSync(file, past, past)
    const read = cache.CacheService.read(input, token, 0)
    expect(read).toEqual(variables)
  })

  it('returns null when the ciphertext is tampered with', () => {
    cache.CacheService.write(input, token, variables)
    const file = cache.cacheFilePath(input)
    expect(existsSync(file)).toBe(true)
    const blob = readFileSync(file)
    blob[blob.length - 1] = (blob[blob.length - 1] ?? 0) ^ 0xff
    writeFileSync(file, blob)
    expect(cache.CacheService.read(input, token, 60_000)).toBeNull()
  })

  it('produces different cache keys for different envs', () => {
    const a = cache.cacheFilePath(input)
    const b = cache.cacheFilePath({ ...input, environmentName: 'staging' })
    expect(a).not.toBe(b)
  })

  it('ignores trailing slashes in the base URL for the cache key', () => {
    const a = cache.cacheFilePath(input)
    const b = cache.cacheFilePath({ ...input, url: 'https://shelve.cloud/' })
    expect(a).toBe(b)
  })
})
