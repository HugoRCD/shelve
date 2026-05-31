import { createHash, randomBytes } from 'node:crypto'
import { describe, test, expect } from 'vitest'
import { verifyDeviceCodeHash } from '../../server/services/cli-device-auth'

function hashDeviceCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

describe('verifyDeviceCodeHash', () => {
  test('returns true for matching device code', () => {
    const code = randomBytes(16).toString('hex')
    const hash = hashDeviceCode(code)
    expect(verifyDeviceCodeHash(hash, code)).toBe(true)
  })

  test('returns false for wrong device code', () => {
    const hash = hashDeviceCode('device-a')
    expect(verifyDeviceCodeHash(hash, 'device-b')).toBe(false)
  })

  test('returns false when hash lengths differ', () => {
    expect(verifyDeviceCodeHash('abcd', 'device-code')).toBe(false)
  })
})
