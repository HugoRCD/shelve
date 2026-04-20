import { describe, test, expect } from 'vitest'
import { generateToken, hashToken, safeEqualHex } from '../../server/utils/tokens'
import { TOKEN_PREFIX, TOKEN_PREFIX_DISPLAY_LENGTH } from '../../server/utils/constants'

describe('generateToken', () => {
  test('returns a token starting with the SHE_ prefix', () => {
    const { token } = generateToken()
    expect(token.startsWith(TOKEN_PREFIX)).toBe(true)
  })

  test('never produces the literal string "undefined" inside the body', () => {
    // The Crockford alphabet must have exactly 32 chars: any gap leaves
    // indices 30/31 as `undefined` and stringifies back into the token.
    for (let i = 0; i < 200; i++) {
      const { token } = generateToken()
      expect(token).not.toContain('undefined')
    }
  })

  test('uses only Crockford base32 characters after the prefix', () => {
    const { token } = generateToken()
    const body = token.slice(TOKEN_PREFIX.length)
    expect(body).toMatch(/^[0-9ABCDEFGHJKMNPQRSTVWXYZ]+$/)
  })

  test('generates cryptographically unique tokens', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 1000; i++) seen.add(generateToken().token)
    expect(seen.size).toBe(1000)
  })

  test('prefix is the display-length head of the token', () => {
    const { token, prefix } = generateToken()
    expect(prefix).toBe(token.slice(0, TOKEN_PREFIX_DISPLAY_LENGTH))
    expect(prefix.length).toBe(TOKEN_PREFIX_DISPLAY_LENGTH)
  })

  test('hash matches sha256(token) as hex', () => {
    const { token, hash } = generateToken()
    expect(hash).toBe(hashToken(token))
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })
})

describe('hashToken', () => {
  test('is deterministic', () => {
    expect(hashToken('she_live_example')).toBe(hashToken('she_live_example'))
  })

  test('produces different hashes for different inputs', () => {
    expect(hashToken('she_live_a')).not.toBe(hashToken('she_live_b'))
  })

  test('returns 64 hex characters (sha256)', () => {
    expect(hashToken('anything')).toMatch(/^[0-9a-f]{64}$/)
  })
})

describe('safeEqualHex', () => {
  test('returns true for identical hex strings', () => {
    const a = hashToken('identical-value')
    expect(safeEqualHex(a, a)).toBe(true)
  })

  test('returns false for different hex strings of equal length', () => {
    expect(safeEqualHex(hashToken('one'), hashToken('two'))).toBe(false)
  })

  test('returns false when the lengths differ (no timingSafeEqual call)', () => {
    expect(safeEqualHex('ff', 'ffff')).toBe(false)
  })

  test('never throws on non-hex input', () => {
    // Buffer.from(str, 'hex') silently drops non-hex chars, so equal-length
    // garbage decodes to identical empty buffers. The point of this test is
    // that the helper handles the input without throwing — callers always
    // pass sha256 hex strings produced by hashToken.
    expect(() => safeEqualHex('zzzz', 'yyyy')).not.toThrow()
  })
})
