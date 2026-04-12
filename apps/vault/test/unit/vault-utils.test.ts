import { describe, test, expect, vi } from 'vitest'
import {
  TTL_MAP,
  calculateTimeLeft,
  formatTimeLeft,
  hashPassword,
  verifyPassword,
  getEncryptionKey,
} from '../../server/utils/vault'

describe('TTL_MAP', () => {
  test('has correct values in seconds', () => {
    expect(TTL_MAP['1d']).toBe(86400)
    expect(TTL_MAP['7d']).toBe(604800)
    expect(TTL_MAP['30d']).toBe(2592000)
    expect(TTL_MAP['Infinite']).toBe(-1)
  })
})

describe('calculateTimeLeft', () => {
  test('returns -1 for Infinite TTL', () => {
    expect(calculateTimeLeft(Date.now(), 'Infinite')).toBe(-1)
  })

  test('returns positive seconds for active TTL', () => {
    const createdAt = Date.now()
    const result = calculateTimeLeft(createdAt, '1d')
    expect(result).toBeGreaterThan(86300)
    expect(result).toBeLessThanOrEqual(86400)
  })

  test('returns 0 for expired TTL', () => {
    const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000)
    expect(calculateTimeLeft(twoDaysAgo, '1d')).toBe(0)
  })

  test('handles 7d TTL correctly', () => {
    const createdAt = Date.now() - (3 * 24 * 60 * 60 * 1000)
    const result = calculateTimeLeft(createdAt, '7d')
    expect(result).toBeGreaterThan(3 * 86400 - 100)
    expect(result).toBeLessThanOrEqual(4 * 86400)
  })

  test('handles 30d TTL correctly', () => {
    const createdAt = Date.now() - (29 * 24 * 60 * 60 * 1000)
    const result = calculateTimeLeft(createdAt, '30d')
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThanOrEqual(86400)
  })

  test('returns 0 when exactly at expiry boundary', () => {
    const createdAt = Date.now() - (30 * 24 * 60 * 60 * 1000) - 1000
    expect(calculateTimeLeft(createdAt, '30d')).toBe(0)
  })
})

describe('formatTimeLeft', () => {
  test('returns "Infinite" for -1', () => {
    expect(formatTimeLeft(-1)).toBe('Infinite')
  })

  test('returns "Expired" for 0', () => {
    expect(formatTimeLeft(0)).toBe('Expired')
  })

  test('returns "Expired" for negative values', () => {
    expect(formatTimeLeft(-100)).toBe('Expired')
  })

  test('returns "Less than 1 minute" for < 60 seconds', () => {
    expect(formatTimeLeft(30)).toBe('Less than 1 minute')
    expect(formatTimeLeft(1)).toBe('Less than 1 minute')
    expect(formatTimeLeft(59)).toBe('Less than 1 minute')
  })

  test('formats minutes only', () => {
    expect(formatTimeLeft(120)).toBe('2m')
    expect(formatTimeLeft(300)).toBe('5m')
  })

  test('formats hours and minutes', () => {
    expect(formatTimeLeft(3660)).toBe('1h 1m')
    expect(formatTimeLeft(7200)).toBe('2h')
  })

  test('formats days, hours and minutes', () => {
    expect(formatTimeLeft(90060)).toBe('1d 1h 1m')
  })

  test('formats days only', () => {
    expect(formatTimeLeft(86400)).toBe('1d')
    expect(formatTimeLeft(172800)).toBe('2d')
  })

  test('formats complex durations', () => {
    const threeDaysTwoHours = 3 * 86400 + 2 * 3600
    expect(formatTimeLeft(threeDaysTwoHours)).toBe('3d 2h')
  })
})

describe('hashPassword', () => {
  test('returns a SHA-256 hex string', async () => {
    const hash = await hashPassword('test-password')
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })

  test('is deterministic', async () => {
    const hash1 = await hashPassword('same-input')
    const hash2 = await hashPassword('same-input')
    expect(hash1).toBe(hash2)
  })

  test('produces different hashes for different inputs', async () => {
    const hash1 = await hashPassword('password-1')
    const hash2 = await hashPassword('password-2')
    expect(hash1).not.toBe(hash2)
  })
})

describe('verifyPassword', () => {
  test('returns true for matching password', async () => {
    const hash = await hashPassword('correct-password')
    expect(await verifyPassword('correct-password', hash)).toBe(true)
  })

  test('returns false for wrong password', async () => {
    const hash = await hashPassword('correct-password')
    expect(await verifyPassword('wrong-password', hash)).toBe(false)
  })
})

describe('getEncryptionKey', () => {
  test('uses password when provided', async () => {
    const key1 = await getEncryptionKey('base-key', 'password')
    const key2 = await getEncryptionKey('base-key')
    expect(key1).not.toBe(key2)
  })

  test('combines base key and password', async () => {
    const key = await getEncryptionKey('base', 'pwd')
    const expected = await hashPassword('base:pwd')
    expect(key).toBe(expected)
  })

  test('uses password alone when no base key', async () => {
    const key = await getEncryptionKey('', 'my-password')
    const expected = await hashPassword('my-password')
    expect(key).toBe(expected)
  })

  test('returns base key directly when >= 32 chars and no password', async () => {
    const longKey = 'a'.repeat(32)
    const key = await getEncryptionKey(longKey)
    expect(key).toBe(longKey)
  })

  test('generates secure key when base key < 32 chars and no password', async () => {
    const shortKey = 'short'
    const key = await getEncryptionKey(shortKey)
    expect(key).toMatch(/^[a-f0-9]{64}$/)
    expect(key).not.toBe(shortKey)
  })

  test('generates secure key when no base key and no password', async () => {
    const key = await getEncryptionKey('')
    expect(key).toMatch(/^[a-f0-9]{64}$/)
  })

  test('ignores whitespace-only password', async () => {
    const keyNoPass = await getEncryptionKey('a'.repeat(32))
    const keySpaces = await getEncryptionKey('a'.repeat(32), '   ')
    expect(keyNoPass).toBe(keySpaces)
  })
})
