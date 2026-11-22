import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { defaultKeyHasher } from '@better-auth/api-key'
import { API_KEY_PREFIX, API_KEY_START_LENGTH } from './constants'

// Standard Crockford base32: 32 chars = 0-9 + A-Z minus I, L, O, U.
// Must contain exactly 32 symbols, otherwise indices 30/31 return undefined
// and the key ends up with the literal string "undefined" inside it.
const CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

function base32Encode(buf: Buffer): string {
  let bits = 0
  let value = 0
  let out = ''
  for (const byte of buf) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      bits -= 5
      out += CROCKFORD_ALPHABET[(value >>> bits) & 31]
    }
  }
  if (bits > 0) out += CROCKFORD_ALPHABET[(value << (5 - bits)) & 31]
  return out
}

/** A new API key, with its hash in the format Better Auth's api-key plugin looks keys up by. */
export async function generateApiKey(): Promise<{ key: string; start: string; hashedKey: string }> {
  const key = `${API_KEY_PREFIX}${base32Encode(randomBytes(32))}`
  return {
    key,
    start: key.slice(0, API_KEY_START_LENGTH),
    hashedKey: await defaultKeyHasher(key),
  }
}

/** Hex SHA-256, for one-time values such as CLI device codes. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  try {
    return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'))
  } catch {
    return false
  }
}
