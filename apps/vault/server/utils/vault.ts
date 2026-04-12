import type { TTLFormat } from '@types'

export const TTL_MAP: Record<TTLFormat, number> = {
  '1d': 24 * 60 * 60,
  '7d': 7 * 24 * 60 * 60,
  '30d': 30 * 24 * 60 * 60,
  'Infinite': -1,
}

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
  const baseKey = encryptionKey || ''

  if (password && password.trim() !== '') {
    const combined = baseKey ? `${baseKey}:${password}` : password
    return await hashPassword(combined)
  }

  if (baseKey && baseKey.length >= 32) {
    return baseKey
  }

  const salt = 'vault-encryption-secured-salt'
  const combined = baseKey ? `${baseKey}:${salt}` : salt
  return await hashPassword(combined)
}
