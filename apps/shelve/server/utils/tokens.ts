import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { TOKEN_PREFIX, TOKEN_PREFIX_DISPLAY_LENGTH } from './constants'

const CROCKFORD_ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789'

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

export function generateToken(): { token: string; prefix: string; hash: string } {
  const body = base32Encode(randomBytes(32))
  const token = `${TOKEN_PREFIX}${body}`
  return {
    token,
    prefix: token.slice(0, TOKEN_PREFIX_DISPLAY_LENGTH),
    hash: hashToken(token),
  }
}

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
