import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { $Fetch } from 'ofetch'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
// Import through the services barrel (not './base' or './env' directly): base.ts
// pulls in the whole utils/config/services module graph via a circular import,
// and only resolves cleanly when services/index.ts is the entry point.
import { EnvService } from '../src/services'

// getApi() is protected static; reaching it the way a real service subclass
// does (via `this.getApi()`) means going through the actual instance's own
// memo slot, so cast is unavoidable here.
type ServiceWithApi = { getApi: () => Promise<$Fetch> }
const getApi = (): Promise<$Fetch> => (EnvService as unknown as ServiceWithApi).getApi()

let cwd: string
let sandbox: string

function writePackage(dir: string, config: object): void {
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'shelve.json'), JSON.stringify(config))
}

beforeEach(() => {
  cwd = process.cwd()
  sandbox = realpathSync(mkdtempSync(join(tmpdir(), 'shelve-api-memo-')))
})

afterEach(() => {
  process.chdir(cwd)
  rmSync(sandbox, { recursive: true, force: true })
})

describe('BaseService.getApi memoization', () => {
  it('rebuilds the client when a monorepo fan-out switches to a package with a different url/token', async () => {
    const pkgA = join(sandbox, 'pkg-a')
    const pkgB = join(sandbox, 'pkg-b')
    writePackage(pkgA, { url: 'http://localhost:3000', token: 'token-a' })
    writePackage(pkgB, { url: 'http://127.0.0.1:7777', token: 'token-b' })

    process.chdir(pkgA)
    const apiA1 = await getApi()
    const apiA2 = await getApi()
    expect(apiA2).toBe(apiA1) // same package config: memo reused, no rebuild

    process.chdir(pkgB)
    const apiB = await getApi()
    expect(apiB).not.toBe(apiA1) // fan-out moved to pkg-b: must not reuse pkg-a's client/token

    process.chdir(pkgA)
    const apiA3 = await getApi()
    expect(apiA3).not.toBe(apiB) // back to pkg-a: must rebuild again, not keep pkg-b's client
  })

  it('rebuilds when only the token changes, even if the url is identical', async () => {
    const pkgA = join(sandbox, 'pkg-a')
    const pkgC = join(sandbox, 'pkg-c')
    writePackage(pkgA, { url: 'http://localhost:3000', token: 'token-a' })
    writePackage(pkgC, { url: 'http://localhost:3000', token: 'token-c' })

    process.chdir(pkgA)
    const apiA = await getApi()

    process.chdir(pkgC)
    const apiC = await getApi()
    expect(apiC).not.toBe(apiA) // same url, different token: must not reuse pkg-a's client
  })
})
