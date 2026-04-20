import { chmodSync, existsSync, readFileSync, unlinkSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { readUserConfig, writeUserConfig } from 'rc9'
import consola from 'consola'
import { DEBUG } from '../constants'

const KEYRING_SERVICE = 'shelve-cli'
const RC_FILENAME = '.shelve'
const LEGACY_RC_PATH = join(homedir(), RC_FILENAME)

type StoredConfig = {
  email?: string
  username?: string
  url?: string
  token?: string
  storage?: 'keyring' | 'file'
}

type KeyringEntry = {
  setPassword: (password: string) => void
  getPassword: () => string | null
  deletePassword: () => boolean
}

let keyringFactory: ((service: string, account: string) => KeyringEntry) | null | undefined

async function loadKeyring(): Promise<((service: string, account: string) => KeyringEntry) | null> {
  if (keyringFactory !== undefined) return keyringFactory

  try {
    const mod = await import('@napi-rs/keyring')
    keyringFactory = (service, account) => new mod.Entry(service, account) as unknown as KeyringEntry
  } catch (err) {
    if (DEBUG) consola.warn(`Keyring unavailable, falling back to file storage: ${err}`)
    keyringFactory = null
  }
  return keyringFactory
}

function accountFor(url: string): string {
  return url.replace(/\/+$/, '').toLowerCase()
}

function xdgConfigDir(): string {
  return process.env.XDG_CONFIG_HOME || join(homedir(), '.config')
}

function configPath(): string {
  return join(xdgConfigDir(), RC_FILENAME)
}

function chmod600(path: string): void {
  if (process.platform === 'win32') return
  try {
    chmodSync(path, 0o600)
  } catch (err) {
    if (DEBUG) consola.warn(`Failed to chmod 600 ${path}: ${err}`)
  }
}

/**
 * Older versions of the CLI stored credentials at `~/.shelve`. rc9 has since
 * deprecated `readUser`/`writeUser` in favor of XDG-compliant
 * `readUserConfig`/`writeUserConfig` which writes to `~/.config/.shelve`.
 * Migrate the legacy file once, then delete it so subsequent reads land on the
 * XDG path.
 */
function migrateLegacyConfig(): void {
  if (!existsSync(LEGACY_RC_PATH)) return

  try {
    const xdgConf = readUserConfig(RC_FILENAME) as StoredConfig
    if (xdgConf.url || xdgConf.token || xdgConf.email) return

    const legacy = parseLegacyRc(readFileSync(LEGACY_RC_PATH, 'utf-8'))
    if (Object.keys(legacy).length === 0) return

    writeUserConfig(legacy, RC_FILENAME)
    chmod600(configPath())
    unlinkSync(LEGACY_RC_PATH)
  } catch (err) {
    if (DEBUG) consola.warn(`Legacy ~/.shelve migration skipped: ${err}`)
  }
}

function parseLegacyRc(contents: string): StoredConfig {
  const out: Record<string, string> = {}
  for (const rawLine of contents.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq < 1) continue
    out[line.slice(0, eq).trim()] = line.slice(eq + 1).trim()
  }
  return out as StoredConfig
}

export class CredentialsService {

  static async writeToken(url: string, token: string, meta: { email: string; username: string }): Promise<void> {
    migrateLegacyConfig()

    const factory = await loadKeyring()
    const account = accountFor(url)

    if (factory) {
      try {
        const entry = factory(KEYRING_SERVICE, account)
        entry.setPassword(token)
        writeUserConfig({ email: meta.email, username: meta.username, url, storage: 'keyring' }, RC_FILENAME)
        chmod600(configPath())
        return
      } catch (err) {
        if (DEBUG) consola.warn(`Keyring write failed, falling back to file: ${err}`)
      }
    }

    writeUserConfig({ token, email: meta.email, username: meta.username, url, storage: 'file' }, RC_FILENAME)
    chmod600(configPath())
    consola.warn(`Stored CLI token in plaintext file (${configPath()}, mode 0600). Install OS keychain support for stronger protection.`)
  }

  static async readToken(url: string): Promise<string | undefined> {
    migrateLegacyConfig()

    const conf = readUserConfig(RC_FILENAME) as StoredConfig

    if (conf.storage === 'keyring' || (!conf.storage && !conf.token)) {
      const factory = await loadKeyring()
      if (factory) {
        try {
          const entry = factory(KEYRING_SERVICE, accountFor(url))
          const pwd = entry.getPassword()
          if (pwd) return pwd
        } catch (err) {
          if (DEBUG) consola.warn(`Keyring read failed: ${err}`)
        }
      }
    }

    return conf.token
  }

  static async clearToken(url: string): Promise<void> {
    migrateLegacyConfig()

    const factory = await loadKeyring()
    if (factory) {
      try {
        const entry = factory(KEYRING_SERVICE, accountFor(url))
        entry.deletePassword()
      } catch { /* ignore */ }
    }
    writeUserConfig({}, RC_FILENAME)
  }

  static readMeta(): StoredConfig {
    migrateLegacyConfig()
    return readUserConfig(RC_FILENAME) as StoredConfig
  }

}
