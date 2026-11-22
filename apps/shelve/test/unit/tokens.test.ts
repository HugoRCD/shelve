import { describe, test, expect, vi, afterEach } from 'vitest'
import type { H3Event } from 'h3'
import { generateToken, hashToken, safeEqualHex } from '../../server/utils/tokens'
import { TOKEN_PREFIX, TOKEN_PREFIX_DISPLAY_LENGTH } from '../../server/utils/constants'
import { getClientIp, isIpInCidr } from '../../server/utils/ip'

type FakeRequest = { forwardedFor?: string; remoteAddress: string }
let trustProxy: unknown = 0
vi.stubGlobal('useRuntimeConfig', () => ({ private: { trustProxy } }))
vi.stubGlobal('getRequestHeader', (event: FakeRequest, name: string) => name === 'x-forwarded-for' ? event.forwardedFor : undefined)
// Like h3 1.15: with `xForwardedFor`, the leftmost entry of the header, which the client controls.
vi.stubGlobal('getRequestIP', (event: FakeRequest, opts?: { xForwardedFor?: boolean }) =>
  opts?.xForwardedFor && event.forwardedFor ? event.forwardedFor.split(',')[0]!.trim() : event.remoteAddress)

const request = (forwardedFor: string | undefined, remoteAddress: string) => ({ forwardedFor, remoteAddress }) as unknown as H3Event

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

describe('isIpInCidr', () => {
  test('matches IPv4 ranges up to their boundaries', () => {
    expect(isIpInCidr('10.0.0.0', '10.0.0.0/8')).toBe(true)
    expect(isIpInCidr('10.255.255.255', '10.0.0.0/8')).toBe(true)
    expect(isIpInCidr('9.255.255.255', '10.0.0.0/8')).toBe(false)
    expect(isIpInCidr('11.0.0.0', '10.0.0.0/8')).toBe(false)
    expect(isIpInCidr('203.0.113.7', '203.0.113.7/32')).toBe(true)
    expect(isIpInCidr('203.0.113.8', '203.0.113.7/32')).toBe(false)
    expect(isIpInCidr('198.51.100.1', '0.0.0.0/0')).toBe(true)
  })

  test('matches IPv6 ranges up to their boundaries', () => {
    const cidr = '2001:db8:abcd:12::/64'
    expect(isIpInCidr('2001:db8:abcd:12::', cidr)).toBe(true)
    expect(isIpInCidr('2001:db8:abcd:12:ffff:ffff:ffff:ffff', cidr)).toBe(true)
    expect(isIpInCidr('2001:db8:abcd:11:ffff:ffff:ffff:ffff', cidr)).toBe(false)
    expect(isIpInCidr('2001:db8:abcd:13::', cidr)).toBe(false)
  })

  test('matches IPv6 prefixes that split a group', () => {
    expect(isIpInCidr('2001:db8:7fff:ffff:ffff:ffff:ffff:ffff', '2001:db8::/33')).toBe(true)
    expect(isIpInCidr('2001:db8:8000::', '2001:db8::/33')).toBe(false)
  })

  test('reads compressed and expanded IPv6 forms alike', () => {
    expect(isIpInCidr('2001:0db8:0000:0000:0000:0000:0000:0001', '2001:db8::1/128')).toBe(true)
    expect(isIpInCidr('2001:db8::1', '2001:0DB8:0:0::1/128')).toBe(true)
    expect(isIpInCidr('::1', '::1/128')).toBe(true)
    expect(isIpInCidr('::2', '::1/128')).toBe(false)
    expect(isIpInCidr('fe80::1', '::/0')).toBe(true)
  })

  test('treats IPv4-mapped IPv6 addresses as IPv4', () => {
    expect(isIpInCidr('::ffff:192.168.1.10', '192.168.1.0/24')).toBe(true)
    expect(isIpInCidr('::ffff:192.168.2.10', '192.168.1.0/24')).toBe(false)
    expect(isIpInCidr('192.168.1.10', '::ffff:c0a8:100/120')).toBe(true)
    expect(isIpInCidr('192.168.2.10', '::ffff:c0a8:100/120')).toBe(false)
  })

  test('never matches across address families', () => {
    expect(isIpInCidr('10.0.0.1', '::/0')).toBe(false)
    expect(isIpInCidr('2001:db8::1', '0.0.0.0/0')).toBe(false)
  })

  test('refuses malformed addresses and ranges', () => {
    expect(isIpInCidr('not-an-ip', '0.0.0.0/0')).toBe(false)
    expect(isIpInCidr('1..2.3', '0.0.0.0/0')).toBe(false)
    expect(isIpInCidr('fe80::1%eth0', '::/0')).toBe(false)
    expect(isIpInCidr('2001:db8::1', '2001:db8::/129')).toBe(false)
    expect(isIpInCidr('10.0.0.1', '10.0.0.0/33')).toBe(false)
    expect(isIpInCidr('10.0.0.1', '10.0.0.0')).toBe(false)
    expect(isIpInCidr('10.0.0.1', '10.0.0.0/8/8')).toBe(false)
  })
})

describe('getClientIp', () => {
  afterEach(() => {
    trustProxy = 0
    vi.unstubAllEnvs()
  })

  test('uses the connection address and ignores X-Forwarded-For without a trusted proxy', () => {
    vi.stubEnv('VERCEL', '')
    expect(getClientIp(request('10.0.0.5', '203.0.113.9'))).toBe('203.0.113.9')
  })

  test('behind trusted proxies, reads the entry the nearest of them added, not one the client sent', () => {
    vi.stubEnv('VERCEL', '')
    trustProxy = 1
    expect(getClientIp(request('10.0.0.5, 198.51.100.4', '192.0.2.1'))).toBe('198.51.100.4')
    trustProxy = 2
    expect(getClientIp(request('10.0.0.5, 198.51.100.4, 192.0.2.50', '192.0.2.1'))).toBe('198.51.100.4')
    trustProxy = true
    expect(getClientIp(request('10.0.0.5, 198.51.100.4', '192.0.2.1'))).toBe('198.51.100.4')
  })

  test('trusts the header Vercel rewrites without any setting', () => {
    vi.stubEnv('VERCEL', '1')
    expect(getClientIp(request('198.51.100.4', '10.1.2.3'))).toBe('198.51.100.4')
  })

  test('falls back to the connection address when the trusted entry is missing or not an IP', () => {
    vi.stubEnv('VERCEL', '')
    trustProxy = 2
    expect(getClientIp(request('198.51.100.4', '192.0.2.1'))).toBe('192.0.2.1')
    trustProxy = 1
    expect(getClientIp(request('x'.repeat(60), '192.0.2.1'))).toBe('192.0.2.1')
    expect(getClientIp(request(undefined, '192.0.2.1'))).toBe('192.0.2.1')
  })
})
