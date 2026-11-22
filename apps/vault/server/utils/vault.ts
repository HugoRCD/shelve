import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import type { TTLFormat } from '@types'

export const TTL_MAP: Record<TTLFormat, number> = {
  '1d': 24 * 60 * 60,
  '7d': 7 * 24 * 60 * 60,
  '30d': 30 * 24 * 60 * 60,
  'Infinite': -1,
}

export const MAX_SECRET_LENGTH = 64 * 1024
export const MAX_READS = 100
export const MAX_PASSWORD_LENGTH = 256
export const MAX_PASSWORD_ATTEMPTS = 5

/** Matches new ids (22 base64url chars) and the shorter base36 ids issued before them. */
export const SHARE_ID_PATTERN = /^[\w-]{1,64}$/

/** The share id is the only credential for a secret without a password, so it must be unguessable. */
export function generateShareId(): string {
  return randomBytes(16).toString('base64url')
}

export const encryptRequestSchema = z.strictObject({
  value: z.string().min(1).max(MAX_SECRET_LENGTH),
  reads: z.number().int().min(1).max(MAX_READS),
  ttl: z.enum(['1d', '7d', '30d', 'Infinite']),
  password: z.string().max(MAX_PASSWORD_LENGTH).optional(),
})

export function calculateTimeLeft(createdAt: number, ttl: TTLFormat): number {
  const ttlInSeconds = TTL_MAP[ttl]

  if (ttlInSeconds === -1) {
    return -1
  }

  const now = Date.now()
  const expiresAt = createdAt + (ttlInSeconds * 1000)
  return Math.max(0, Math.floor((expiresAt - now) / 1000))
}

export function formatTimeLeft(seconds: number): string {
  if (seconds === -1) return 'Infinite'

  if (seconds <= 0) return 'Expired'

  const days = Math.floor(seconds / (24 * 60 * 60))
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((seconds % (60 * 60)) / 60)

  const parts = []

  if (days > 0) {
    parts.push(`${days}d`)
  }
  if (hours > 0) {
    parts.push(`${hours}h`)
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`)
  }

  if (parts.length === 0) {
    return 'Less than 1 minute'
  }

  return parts.join(' ')
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

export async function getEncryptionKey(encryptionKey: string, password?: string): Promise<string> {
  // Without the server key, the key would only depend on public values, or on the password whose hash is stored with the secret.
  if (!encryptionKey) throw new Error('NUXT_PRIVATE_ENCRYPTION_KEY is not set')

  if (password && password.trim() !== '') {
    return await hashPassword(`${encryptionKey}:${password}`)
  }

  if (encryptionKey.length >= 32) {
    return encryptionKey
  }

  return await hashPassword(`${encryptionKey}:vault-encryption-secured-salt`)
}
