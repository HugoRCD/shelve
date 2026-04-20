import { mkdtempSync, existsSync, writeFileSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Force the keyring import to throw so CredentialsService falls back to the
// file-based storage. This keeps the test hermetic (no OS keychain touched)
// while still exercising the migration + file paths.
vi.mock('@napi-rs/keyring', () => {
  throw new Error('keyring unavailable in tests')
})

type CredentialsModule = typeof import('../src/services/credentials')

describe('CredentialsService (file fallback)', () => {
  const originalHome = process.env.HOME
  const originalXdg = process.env.XDG_CONFIG_HOME
  const originalUserProfile = process.env.USERPROFILE
  let sandbox: string

  beforeEach(() => {
    sandbox = mkdtempSync(join(tmpdir(), 'shelve-creds-'))
    process.env.HOME = sandbox
    process.env.USERPROFILE = sandbox
    process.env.XDG_CONFIG_HOME = join(sandbox, '.config')
    vi.resetModules()
  })

  afterEach(() => {
    rmSync(sandbox, { recursive: true, force: true })
    process.env.HOME = originalHome
    process.env.USERPROFILE = originalUserProfile
    process.env.XDG_CONFIG_HOME = originalXdg
  })

  async function loadModule(): Promise<CredentialsModule> {
    return await import('../src/services/credentials')
  }

  it('writes and reads back a token via the file fallback', async () => {
    const creds = await loadModule()
    await creds.CredentialsService.writeToken('https://shelve.cloud', 'she_live_token', {
      email: 'u@example.com',
      username: 'u',
    })

    const token = await creds.CredentialsService.readToken('https://shelve.cloud')
    expect(token).toBe('she_live_token')

    const meta = creds.CredentialsService.readMeta()
    expect(meta.email).toBe('u@example.com')
    expect(meta.username).toBe('u')
    expect(meta.storage).toBe('file')
  })

  it('writes the config under XDG_CONFIG_HOME', async () => {
    const creds = await loadModule()
    await creds.CredentialsService.writeToken('https://shelve.cloud', 'tkn', {
      email: 'a@b.co',
      username: 'ab',
    })
    expect(existsSync(join(sandbox, '.config', '.shelve'))).toBe(true)
  })

  it('clearToken removes the stored token', async () => {
    const creds = await loadModule()
    await creds.CredentialsService.writeToken('https://shelve.cloud', 'tkn', {
      email: 'a@b.co',
      username: 'ab',
    })
    await creds.CredentialsService.clearToken('https://shelve.cloud')
    const after = await creds.CredentialsService.readToken('https://shelve.cloud')
    expect(after).toBeUndefined()
  })

  it('migrates a legacy ~/.shelve file on first read and deletes it', async () => {
    const legacyPath = join(sandbox, '.shelve')
    writeFileSync(
      legacyPath,
      ['token=legacy_tkn', 'email=legacy@example.com', 'username=legacy', 'url=https://shelve.cloud'].join('\n'),
      'utf-8'
    )

    const creds = await loadModule()
    const token = await creds.CredentialsService.readToken('https://shelve.cloud')
    expect(token).toBe('legacy_tkn')
    expect(existsSync(legacyPath)).toBe(false)

    const xdgFile = join(sandbox, '.config', '.shelve')
    expect(existsSync(xdgFile)).toBe(true)
    const content = readFileSync(xdgFile, 'utf-8')
    expect(content).toContain('legacy_tkn')
    expect(content).toContain('legacy@example.com')
  })

  it('does not migrate when the XDG file already holds data', async () => {
    const creds = await loadModule()
    await creds.CredentialsService.writeToken('https://shelve.cloud', 'new_tkn', {
      email: 'new@example.com',
      username: 'new',
    })

    writeFileSync(join(sandbox, '.shelve'), 'token=legacy_tkn\n', 'utf-8')

    const token = await creds.CredentialsService.readToken('https://shelve.cloud')
    expect(token).toBe('new_tkn')
  })
})
