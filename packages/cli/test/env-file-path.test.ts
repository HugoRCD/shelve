import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@napi-rs/keyring', () => {
  throw new Error('keyring unavailable in tests')
})

type ServicesModule = typeof import('../src/services')

const ENV_KEYS = ['HOME', 'USERPROFILE', 'XDG_CONFIG_HOME', 'SHELVE_TOKEN', 'SHELVE_URL']
const variables = [{ key: 'SECRET', value: 'from-shelve' }]

let cwd: string
let sandbox: string
let project: string
let outside: string
let savedEnv: Record<string, string | undefined>
let services: ServicesModule

beforeEach(async () => {
  cwd = process.cwd()
  savedEnv = Object.fromEntries(ENV_KEYS.map(key => [key, process.env[key]]))
  delete process.env.SHELVE_URL
  sandbox = realpathSync(mkdtempSync(join(tmpdir(), 'shelve-env-path-')))
  process.env.HOME = sandbox
  process.env.USERPROFILE = sandbox
  process.env.XDG_CONFIG_HOME = join(sandbox, '.config')
  process.env.SHELVE_TOKEN = 'test-token'

  project = join(sandbox, 'project')
  outside = join(sandbox, 'outside')
  mkdirSync(project)
  mkdirSync(outside)
  writeFileSync(join(project, 'package.json'), JSON.stringify({ name: 'project' }))
  writeFileSync(join(outside, 'target'), 'ORIGINAL\n')
  process.chdir(project)

  vi.resetModules()
  services = await import('../src/services')
})

afterEach(() => {
  process.chdir(cwd)
  for (const [key, value] of Object.entries(savedEnv)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  rmSync(sandbox, { recursive: true, force: true })
})

function createEnvFile(envFileName: string, pullMode: 'replace' | 'merge' = 'replace'): Promise<void> {
  return services.EnvService.createEnvFile({ envFileName, variables, confirmChanges: false, pullMode })
}

describe('envFileName stays inside the project', () => {
  it('rejects a relative path that leaves the project directory', async () => {
    await expect(createEnvFile('../outside/.env')).rejects.toThrow(/outside the project/)

    expect(existsSync(join(outside, '.env'))).toBe(false)
  })

  it('rejects an absolute path', async () => {
    await expect(createEnvFile(join(outside, 'target'))).rejects.toThrow(/outside the project/)

    expect(readFileSync(join(outside, 'target'), 'utf-8')).toBe('ORIGINAL\n')
  })

  it('rejects a path through a directory symlinked outside the project', async () => {
    symlinkSync(outside, join(project, 'linked'))

    await expect(createEnvFile('linked/.env')).rejects.toThrow(/outside the project/)

    expect(existsSync(join(outside, '.env'))).toBe(false)
  })

  it('refuses to write through a symlinked env file', async () => {
    symlinkSync('config.env', join(project, '.env'))
    writeFileSync(join(project, 'config.env'), 'ORIGINAL\n')

    await expect(createEnvFile('.env', 'merge')).rejects.toThrow(/symbolic link/)

    expect(readFileSync(join(project, 'config.env'), 'utf-8')).toBe('ORIGINAL\n')
  })

  it('refuses to write through a symlinked .example file', async () => {
    symlinkSync(join(outside, 'target'), join(project, '.env.example'))

    await expect(createEnvFile('.env')).rejects.toThrow(/symbolic link/)

    expect(readFileSync(join(outside, 'target'), 'utf-8')).toBe('ORIGINAL\n')
  })

  it('refuses to read an env file outside the project for push and diff', async () => {
    writeFileSync(join(outside, 'secrets'), 'AWS_SECRET_ACCESS_KEY=abc\n')
    writeFileSync(join(project, 'shelve.json'), JSON.stringify({ project: 'p', slug: 's', envFileName: '../outside/secrets' }))

    await expect(services.EnvService.getEnvFile()).rejects.toThrow(/outside the project/)
  })

  it('writes a nested env file inside the project', async () => {
    mkdirSync(join(project, 'config'))

    await createEnvFile('config/.env.local')

    expect(readFileSync(join(project, 'config', '.env.local'), 'utf-8')).toContain('SECRET=from-shelve')
  })

  it.skipIf(process.platform === 'win32')('writes the env file readable by its owner only', async () => {
    writeFileSync(join(project, '.env'), 'OLD=1\n', { mode: 0o644 })

    await createEnvFile('.env', 'merge')

    expect(statSync(join(project, '.env')).mode & 0o777).toBe(0o600)
  })
})
