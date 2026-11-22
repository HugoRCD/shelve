import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// File storage only: these tests must never touch the real OS keychain.
vi.mock('@napi-rs/keyring', () => {
  throw new Error('keyring unavailable in tests')
})

type ConfigModule = typeof import('../src/utils/config')

const ENV_KEYS = [
  'HOME',
  'USERPROFILE',
  'XDG_CONFIG_HOME',
  'SHELVE_TOKEN',
  'SHELVE_URL',
  'SHELVE_PROJECT',
  'SHELVE_TEAM_SLUG',
  'SHELVE_DEFAULT_ENV',
  'NODE_TLS_REJECT_UNAUTHORIZED',
]

let cwd: string
let sandbox: string
let savedEnv: Record<string, string | undefined>
let config: ConfigModule

function writeRepoFile(name: string, content: string): void {
  writeFileSync(join(sandbox, 'repo', name), content)
}

beforeEach(async () => {
  cwd = process.cwd()
  savedEnv = Object.fromEntries(ENV_KEYS.map(key => [key, process.env[key]]))
  for (const key of ENV_KEYS) delete process.env[key]

  sandbox = realpathSync(mkdtempSync(join(tmpdir(), 'shelve-token-binding-')))
  process.env.HOME = sandbox
  process.env.USERPROFILE = sandbox
  process.env.XDG_CONFIG_HOME = join(sandbox, '.config')
  mkdirSync(join(sandbox, '.config'))
  // The user logged in to the default Shelve instance: the stored token belongs to it
  writeFileSync(
    join(sandbox, '.config', '.shelve'),
    'url=https://app.shelve.cloud\ntoken=stored-token\nusername=me\nstorage=file\n',
  )

  mkdirSync(join(sandbox, 'repo'))
  writeRepoFile('package.json', JSON.stringify({ name: 'repo' }))
  process.chdir(join(sandbox, 'repo'))

  // credentials.ts reads homedir() at load time, so load it after HOME moved
  vi.resetModules()
  config = await import('../src/utils/config')
})

afterEach(() => {
  process.chdir(cwd)
  for (const [key, value] of Object.entries(savedEnv)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  rmSync(sandbox, { recursive: true, force: true })
})

describe('which token is sent to which url', () => {
  it('uses the stored token for the url it was issued for', async () => {
    writeRepoFile('shelve.json', JSON.stringify({ project: 'p', slug: 's' }))

    const loaded = await config.loadShelveConfig()

    expect(loaded.url).toBe('https://app.shelve.cloud')
    expect(loaded.token).toBe('stored-token')
  })

  it('does not attach the stored token to a url set by the repository shelve.json', async () => {
    writeRepoFile('shelve.json', JSON.stringify({ project: 'p', slug: 's', url: 'http://127.0.0.1:47811' }))

    const loaded = await config.loadShelveConfig()

    expect(loaded.url).toBe('http://127.0.0.1:47811')
    expect(loaded.token).toBeUndefined()
  })

  it('ignores a token field in the repository shelve.json', async () => {
    writeRepoFile('shelve.json', JSON.stringify({ project: 'p', slug: 's', token: 'repo-token' }))

    const loaded = await config.loadShelveConfig()

    expect(loaded.token).toBe('stored-token')
  })

  it('does not load the repository .env into the process environment', async () => {
    writeRepoFile('shelve.json', JSON.stringify({ project: 'p', slug: 's' }))
    writeRepoFile('.env', 'SHELVE_URL=http://127.0.0.1:47811\nNODE_TLS_REJECT_UNAUTHORIZED=0\n')

    const loaded = await config.loadShelveConfig()

    expect(loaded.url).toBe('https://app.shelve.cloud')
    expect(process.env.SHELVE_URL).toBeUndefined()
    expect(process.env.NODE_TLS_REJECT_UNAUTHORIZED).toBeUndefined()
  })

  it('still sends SHELVE_TOKEN from the real environment to the resolved url', async () => {
    process.env.SHELVE_TOKEN = 'ci-token'
    writeRepoFile('shelve.json', JSON.stringify({ project: 'p', slug: 's', url: 'http://localhost:3000' }))

    const loaded = await config.loadShelveConfig()

    expect(loaded.token).toBe('ci-token')
  })

  it('refuses a plain http url for a host other than this machine', async () => {
    writeRepoFile('shelve.json', JSON.stringify({ project: 'p', slug: 's', url: 'http://shelve.example.com' }))

    await expect(config.loadShelveConfig()).rejects.toThrow(/https:\/\//)
  })

  it.each(['http://localhost:3000', 'http://127.0.0.1:3000', 'http://[::1]:3000', 'https://shelve.example.com'])(
    'accepts %s',
    async (url) => {
      writeRepoFile('shelve.json', JSON.stringify({ project: 'p', slug: 's', url }))

      await expect(config.loadShelveConfig()).resolves.toMatchObject({ url })
    },
  )
})
