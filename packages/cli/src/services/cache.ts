import { createCipheriv, createDecipheriv, createHash, hkdfSync, randomBytes } from 'node:crypto'
import { mkdirSync, readFileSync, renameSync, writeFileSync, statSync, chmodSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { EnvVarExport } from '@types'
import consola from 'consola'
import { DEBUG } from '../constants'

const CACHE_DIR = join(homedir(), '.shelve', 'cache')
const CACHE_VERSION = 1
const CACHE_INFO = Buffer.from('shelve-cache-v1')
const KEY_LENGTH = 32
const IV_LENGTH = 12
const TAG_LENGTH = 16

type CachePayload = {
  v: number
  ts: number
  variables: EnvVarExport[]
}

export type CacheKeyInput = {
  url: string
  teamSlug: string
  projectName: string
  environmentName: string
}

function ensureCacheDir(): void {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true, mode: 0o700 })
  }
}

function chmod600(path: string): void {
  if (process.platform === 'win32') return
  try {
    chmodSync(path, 0o600)
  } catch (err) {
    if (DEBUG) consola.warn(`Failed to chmod 600 ${path}: ${err}`)
  }
}

export function cacheFilePath(input: CacheKeyInput): string {
  const id = createHash('sha256')
    .update(`${input.url.replace(/\/+$/, '')}|${input.teamSlug}|${input.projectName}|${input.environmentName}`)
    .digest('hex')
  return join(CACHE_DIR, `${id}.cache`)
}

function deriveKey(token: string, salt: Buffer): Buffer {
  return Buffer.from(hkdfSync('sha256', Buffer.from(token), salt, CACHE_INFO, KEY_LENGTH))
}

export class CacheService {

  static write(input: CacheKeyInput, token: string, variables: EnvVarExport[]): void {
    if (!token) return
    try {
      ensureCacheDir()
      const file = cacheFilePath(input)
      const salt = randomBytes(16)
      const key = deriveKey(token, salt)
      const iv = randomBytes(IV_LENGTH)
      const cipher = createCipheriv('aes-256-gcm', key, iv)
      const payload: CachePayload = { v: CACHE_VERSION, ts: Date.now(), variables }
      const plaintext = Buffer.from(JSON.stringify(payload), 'utf-8')
      const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])
      const tag = cipher.getAuthTag()
      const blob = Buffer.concat([
        Buffer.from([CACHE_VERSION]),
        salt,
        iv,
        tag,
        ciphertext,
      ])
      const tmp = `${file}.${process.pid}.tmp`
      writeFileSync(tmp, blob, { mode: 0o600 })
      renameSync(tmp, file)
      chmod600(file)
    } catch (err) {
      if (DEBUG) consola.warn(`Failed to write cache: ${err}`)
    }
  }

  static read(input: CacheKeyInput, token: string, ttlMs: number): EnvVarExport[] | null {
    if (!token) return null
    const file = cacheFilePath(input)
    if (!existsSync(file)) return null

    try {
      const stat = statSync(file)
      if (ttlMs > 0 && Date.now() - stat.mtimeMs > ttlMs) {
        return null
      }

      const blob = readFileSync(file)
      if (blob.length < 1 + 16 + IV_LENGTH + TAG_LENGTH) return null
      if (blob[0] !== CACHE_VERSION) return null

      const salt = blob.subarray(1, 17)
      const iv = blob.subarray(17, 17 + IV_LENGTH)
      const tag = blob.subarray(17 + IV_LENGTH, 17 + IV_LENGTH + TAG_LENGTH)
      const ciphertext = blob.subarray(17 + IV_LENGTH + TAG_LENGTH)

      const key = deriveKey(token, salt)
      const decipher = createDecipheriv('aes-256-gcm', key, iv)
      decipher.setAuthTag(tag)
      const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()])
      const payload = JSON.parse(plaintext.toString('utf-8')) as CachePayload
      if (payload.v !== CACHE_VERSION) return null
      return payload.variables
    } catch (err) {
      if (DEBUG) consola.warn(`Cache read failed (will refetch): ${err}`)
      return null
    }
  }

}
