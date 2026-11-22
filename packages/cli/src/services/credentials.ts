import { createHash } from 'node:crypto'
import { chmodSync, existsSync, mkdirSync, readFileSync, unlinkSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { readUserConfig, updateUserConfig, writeUserConfig } from 'rc9'
import consola from 'consola'
import { DEFAULT_URL } from '@types'
import { isDebug, debugLog } from '../constants'

const KEYRING_SERVICE = 'shelve-cli'
const RC_FILENAME = '.shelve'
const LEGACY_RC_PATH = join(homedir(), RC_FILENAME)

type StoredConfig = {
  email?: string
  username?: string
  /** The user's default server; `token` belongs to it */
  url?: string
  token?: string
  /** File-stored tokens for servers other than the default one, keyed by tokenKey(url) */
  tokens?: Record<string, string>
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
    keyringFactory = (service: string, account: string): KeyringEntry => new mod.Entry(service, account) as unknown as KeyringEntry
  } catch (err) {
    if (isDebug()) debugLog('Keyring unavailable, falling back to file storage', err)
    keyringFactory = null
  }
  return keyringFactory
}

function accountFor(url: string): string {
  return url.replace(/\/+$/, '').toLowerCase()
}

/**
 * Key for a server in StoredConfig.tokens. rc9 splits keys on dots, so the url
 * can't be the key itself; the leading letter keeps rc9 from reading the map as
 * an array when the hash starts with a digit.
 */
function tokenKey(url: string): string {
  return `u${createHash('sha256').update(accountFor(url)).digest('hex').slice(0, 32)}`
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
    if (isDebug()) debugLog(`Failed to chmod 600 ${path}`, err)
  }
}

/**
 * rc9 does not mkdir the target directory, so `writeUserConfig` would fail on
 * a freshly provisioned machine where `$XDG_CONFIG_HOME` (or `~/.config`)
 * does not yet exist. Make sure the parent exists before handing off to rc9.
 */
function ensureConfigDir(): void {
  const dir = dirname(configPath())
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true, mode: 0o700 })
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

    ensureConfigDir()
    writeUserConfig(legacy, RC_FILENAME)
    chmod600(configPath())
    unlinkSync(LEGACY_RC_PATH)
  } catch (err) {
    if (isDebug()) debugLog('Legacy ~/.shelve migration skipped', err)
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

  /**
   * Stores `token` for `url`.
   *
   * @param setDefault - Also make `url` the user's default server. Pass false for a
   *   url set by a repository: it gets its own token, but must not redirect every
   *   other repository to that server.
   */
  static async writeToken(
    url: string,
    token: string,
    meta: { email: string; username: string },
    setDefault = true,
  ): Promise<void> {
    migrateLegacyConfig()

    const factory = await loadKeyring()
    const account = accountFor(url)
    const { tokens } = readUserConfig(RC_FILENAME) as StoredConfig
    const otherTokens = tokens ? { tokens } : {}

    ensureConfigDir()

    if (factory) {
      try {
        const entry = factory(KEYRING_SERVICE, account)
        entry.setPassword(token)
        if (setDefault) {
          writeUserConfig({ ...otherTokens, email: meta.email, username: meta.username, url, storage: 'keyring' }, RC_FILENAME)
          chmod600(configPath())
        }
        return
      } catch (err) {
        if (isDebug()) debugLog('Keyring write failed, falling back to file', err)
      }
    }

    if (setDefault) {
      writeUserConfig({ ...otherTokens, token, email: meta.email, username: meta.username, url, storage: 'file' }, RC_FILENAME)
    } else {
      updateUserConfig({ tokens: { [tokenKey(url)]: token } }, RC_FILENAME)
    }
    chmod600(configPath())
    consola.warn(`Stored CLI API key in plaintext file (${configPath()}, mode 0600). Install OS keychain support for stronger protection.`)
  }

  static async readToken(url: string): Promise<string | undefined> {
    migrateLegacyConfig()

    const conf = readUserConfig(RC_FILENAME) as StoredConfig

    // A token in the file belongs to the server it was stored for, whatever url is asked for
    if (conf.token && accountFor(conf.url || DEFAULT_URL) === accountFor(url)) return conf.token
    const fileToken = conf.tokens?.[tokenKey(url)]
    if (fileToken) return fileToken

    const factory = await loadKeyring()
    if (factory) {
      try {
        const entry = factory(KEYRING_SERVICE, accountFor(url))
        const pwd = entry.getPassword()
        if (pwd) return pwd
      } catch (err) {
        if (isDebug()) debugLog('Keyring read failed', err)
      }
    }

    return undefined
  }

  /**
   * Whether `url` is a server the user chose themselves: SHELVE_URL from the
   * environment, or the default stored at login (app.shelve.cloud until then).
   */
  static isDefaultServer(url: string): boolean {
    const { url: storedUrl } = this.readMeta()
    return accountFor(url) === accountFor(process.env.SHELVE_URL || storedUrl || DEFAULT_URL)
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
    ensureConfigDir()
    writeUserConfig({}, RC_FILENAME)
  }

  static readMeta(): StoredConfig {
    migrateLegacyConfig()
    return readUserConfig(RC_FILENAME) as StoredConfig
  }

}
