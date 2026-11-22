import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

// The device flow refuses to start without a TTY; these tests drive it directly.
vi.mock('../src/utils/cli-context', async importOriginal => ({
  ...await importOriginal<typeof import('../src/utils/cli-context')>(),
  isNonInteractive: (): boolean => false,
}))

// In-memory keychain, so the real OS keychain is never touched.
const { keychain } = vi.hoisted(() => ({ keychain: new Map<string, string>() }))
vi.mock('@napi-rs/keyring', () => ({
  Entry: class {

    readonly id: string

    constructor(service: string, account: string) {
      this.id = `${service}:${account}`
    }

    setPassword(password: string): void {
      keychain.set(this.id, password)
    }

    getPassword(): string | null {
      return keychain.get(this.id) ?? null
    }

    deletePassword(): boolean {
      return keychain.delete(this.id)
    }

  },
}))

const ENV_KEYS = ['HOME', 'USERPROFILE', 'XDG_CONFIG_HOME', 'PATH', 'SHELVE_TOKEN', 'SHELVE_URL']

let server: Server
let base: string
let verificationUri: (base: string) => string

let cwd: string
let sandbox: string
let openerLog: string
let savedEnv: Record<string, string | undefined>

beforeAll(async () => {
  server = createServer((req, res) => {
    const send = (body: unknown): void => {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify(body))
    }
    if (req.url === '/api/auth/device') {
      return send({
        device_code: 'dc',
        user_code: 'ABCD-EFGH',
        verification_uri: verificationUri(base),
        expires_in: 5,
        interval: 0,
      })
    }
    if (req.url === '/api/auth/device/token') return send({ status: 'approved', access_token: 'issued-token' })
    if (req.url === '/api/user/me') return send({ id: 1, username: 'u', email: 'u@example.com' })
    res.writeHead(404)
    res.end()
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
})

afterAll(() => {
  server.close()
})

beforeEach(() => {
  cwd = process.cwd()
  savedEnv = Object.fromEntries(ENV_KEYS.map(key => [key, process.env[key]]))
  delete process.env.SHELVE_TOKEN
  delete process.env.SHELVE_URL
  keychain.clear()

  sandbox = realpathSync(mkdtempSync(join(tmpdir(), 'shelve-login-')))
  process.env.HOME = sandbox
  process.env.USERPROFILE = sandbox
  process.env.XDG_CONFIG_HOME = join(sandbox, '.config')
  mkdirSync(join(sandbox, '.config'))

  // Stand-in browser openers: record their arguments instead of opening anything
  openerLog = join(sandbox, 'opener.log')
  const bin = join(sandbox, 'bin')
  mkdirSync(bin)
  for (const name of ['xdg-open', 'open']) {
    writeFileSync(join(bin, name), `#!/bin/sh\nprintf '%s\\n' "$*" >> '${openerLog}'\n`)
    chmodSync(join(bin, name), 0o755)
  }
  process.env.PATH = `${bin}:${savedEnv.PATH}`

  vi.resetModules()
})

afterEach(() => {
  process.chdir(cwd)
  for (const [key, value] of Object.entries(savedEnv)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  rmSync(sandbox, { recursive: true, force: true })
})

describe.skipIf(process.platform === 'win32')('device login', () => {
  it('passes the verification url to the browser opener without a shell', async () => {
    const marker = join(sandbox, 'command-ran')
    verificationUri = (url: string): string => `${url}/cli/authorize?user_code=$(touch ${marker})`
    const { loginWithDeviceFlow } = await import('../src/services/device-auth')

    await expect(loginWithDeviceFlow(base)).resolves.toBe('issued-token')

    expect(existsSync(marker)).toBe(false)
    expect(readFileSync(openerLog, 'utf-8').trim()).toBe(new URL(verificationUri(base)).href)
  })

  it('does not open a verification url on another origin', async () => {
    verificationUri = (): string => 'https://evil.example/cli/authorize'
    const { loginWithDeviceFlow } = await import('../src/services/device-auth')

    await expect(loginWithDeviceFlow(base)).resolves.toBe('issued-token')

    expect(existsSync(openerLog)).toBe(false)
  })

  it('opens a verification url on the server origin', async () => {
    verificationUri = (url: string): string => `${url}/cli/authorize?user_code=ABCD-EFGH`
    const { loginWithDeviceFlow } = await import('../src/services/device-auth')

    await loginWithDeviceFlow(base)

    expect(readFileSync(openerLog, 'utf-8').trim()).toBe(`${base}/cli/authorize?user_code=ABCD-EFGH`)
  })

  it('keeps the default url when logging in to a url set by the repository', async () => {
    verificationUri = (url: string): string => `${url}/cli/authorize?user_code=ABCD-EFGH`
    const rc = join(sandbox, '.config', '.shelve')
    writeFileSync(rc, 'url=https://app.shelve.cloud\nemail=me@example.com\nusername=me\nstorage=keyring\n')
    keychain.set('shelve-cli:https://app.shelve.cloud', 'default-token')
    const repo = join(sandbox, 'repo')
    mkdirSync(repo)
    writeFileSync(join(repo, 'shelve.json'), JSON.stringify({ project: 'p', slug: 's', url: base }))
    process.chdir(repo)
    // getToken is a static on BaseService; the services barrel is the import that
    // resolves base.ts's circular imports (see api-memo.test.ts)
    const services = await import('../src/services')

    await expect(services.EnvService.getToken()).resolves.toBe('issued-token')

    expect(keychain.get(`shelve-cli:${base}`)).toBe('issued-token')
    expect(keychain.get('shelve-cli:https://app.shelve.cloud')).toBe('default-token')
    const rcContent = readFileSync(rc, 'utf-8')
    expect(rcContent).toContain('https://app.shelve.cloud')
    expect(rcContent).not.toContain(base)
  })
})
