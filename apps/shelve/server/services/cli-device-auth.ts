import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { and, eq, lt } from 'drizzle-orm'
import type { TokenScopes, User } from '@types'
import { cliDeviceAuth } from '../db/schema'
import type { CliDeviceClientMeta } from '../db/schema'
import { generateToken, hashToken, safeEqualHex } from '../utils/tokens'
import { logAuditForTeams, resolveTeamIdsFromTokenScopes } from './audit'

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
const DEVICE_AUTH_TTL_SECONDS = 15 * 60
const POLL_INTERVAL_SECONDS = 5
const CLI_TOKEN_EXPIRES_SECONDS = 90 * 24 * 60 * 60
const DEVICE_INIT_RATE_LIMIT = 10
const DEVICE_POLL_RATE_LIMIT = 120
const RATE_WINDOW_MS = 60 * 1000

const initAttempts = new Map<string, { count: number, resetAt: number }>()
const pollAttempts = new Map<string, { count: number, resetAt: number }>()

export const CLI_DEVICE_AUTH = {
  ttlSeconds: DEVICE_AUTH_TTL_SECONDS,
  pollIntervalSeconds: POLL_INTERVAL_SECONDS,
} as const

export type DeviceAuthStartResult = {
  device_code: string
  user_code: string
  verification_uri: string
  expires_in: number
  interval: number
}

function base32Encode(buf: Buffer): string {
  let bits = 0
  let value = 0
  let out = ''
  for (const byte of buf) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      bits -= 5
      out += CROCKFORD[(value >>> bits) & 31]
    }
  }
  if (bits > 0) out += CROCKFORD[(value << (5 - bits)) & 31]
  return out
}

function hashDeviceCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

function generateUserCode(): string {
  const raw = base32Encode(randomBytes(5)).slice(0, 8)
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}`
}

function generateDeviceCode(): string {
  return base32Encode(randomBytes(32))
}

function normalizeUserCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, '')
}

function checkRateLimit(
  map: Map<string, { count: number, resetAt: number }>,
  key: string,
  max: number,
): { allowed: boolean } {
  const now = Date.now()
  const entry = map.get(key)
  if (!entry || now >= entry.resetAt) {
    map.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return { allowed: true }
  }
  if (entry.count >= max) return { allowed: false }
  entry.count += 1
  return { allowed: true }
}

export function getClientIp(event: H3Event): string {
  return getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
}

async function expireStalePending(): Promise<void> {
  await db.update(cliDeviceAuth)
    .set({ status: 'expired' })
    .where(and(
      eq(cliDeviceAuth.status, 'pending'),
      lt(cliDeviceAuth.expiresAt, new Date()),
    ))
}

function findByDeviceCode(deviceCode: string) {
  const hash = hashDeviceCode(deviceCode)
  return db.query.cliDeviceAuth.findFirst({
    where: eq(cliDeviceAuth.deviceCodeHash, hash),
  })
}

function findByUserCode(userCode: string) {
  const normalized = normalizeUserCode(userCode)
  return db.query.cliDeviceAuth.findFirst({
    where: eq(cliDeviceAuth.userCode, normalized),
  })
}

function assertNotExpired(row: { expiresAt: Date, status: string }) {
  if (row.status === 'expired' || row.expiresAt.getTime() < Date.now()) {
    throw createError({ statusCode: 400, statusMessage: 'Device authorization expired' })
  }
}

export async function startDeviceAuth(
  event: H3Event,
  clientMeta?: CliDeviceClientMeta,
): Promise<DeviceAuthStartResult> {
  const ip = getClientIp(event)
  const rate = checkRateLimit(initAttempts, ip, DEVICE_INIT_RATE_LIMIT)
  if (!rate.allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too many device login attempts. Try again later.' })
  }

  await expireStalePending()

  const { origin } = getRequestURL(event)
  let userCode = generateUserCode()
  let deviceCode = generateDeviceCode()
  const expiresAt = new Date(Date.now() + DEVICE_AUTH_TTL_SECONDS * 1000)

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await db.insert(cliDeviceAuth).values({
        deviceCodeHash: hashDeviceCode(deviceCode),
        userCode,
        clientMeta: clientMeta ?? {},
        expiresAt,
      })
      break
    } catch {
      userCode = generateUserCode()
      deviceCode = generateDeviceCode()
      if (attempt === 4) {
        throw createError({ statusCode: 500, statusMessage: 'Failed to start device authorization' })
      }
    }
  }

  const verificationUri = `${origin}/cli/authorize?user_code=${encodeURIComponent(userCode)}`

  return {
    device_code: deviceCode,
    user_code: userCode,
    verification_uri: verificationUri,
    expires_in: DEVICE_AUTH_TTL_SECONDS,
    interval: POLL_INTERVAL_SECONDS,
  }
}

export async function getDeviceAuthStatus(userCode: string) {
  await expireStalePending()
  const row = await findByUserCode(userCode)
  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Authorization request not found' })
  }
  if (row.expiresAt.getTime() < Date.now() && row.status === 'pending') {
    await db.update(cliDeviceAuth).set({ status: 'expired' }).where(eq(cliDeviceAuth.id, row.id))
    throw createError({ statusCode: 400, statusMessage: 'Device authorization expired' })
  }
  return {
    status: row.status,
    clientMeta: row.clientMeta ?? {},
    expiresAt: row.expiresAt,
  }
}

function cliTokenName(clientMeta?: CliDeviceClientMeta | null): string {
  const host = clientMeta?.hostname?.trim()
  const name = host ? `CLI — ${host}` : 'CLI'
  return name.slice(0, 25)
}

export async function approveDeviceAuth(event: H3Event, user: User, userCode: string) {
  await expireStalePending()
  const row = await findByUserCode(userCode)
  if (!row || row.status !== 'pending') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid or expired authorization request' })
  }
  assertNotExpired(row)

  const { token, prefix, hash } = generateToken()
  const expiresAt = new Date(Date.now() + CLI_TOKEN_EXPIRES_SECONDS * 1000)
  const scopes: TokenScopes = { permissions: ['read', 'write'] }

  const [created] = await db.insert(schema.tokens)
    .values({
      hash,
      prefix,
      name: cliTokenName(row.clientMeta),
      userId: user.id,
      scopes,
      allowedCidrs: [],
      expiresAt,
    })
    .returning()

  if (!created) throw createError({ statusCode: 500, statusMessage: 'Failed to create CLI token' })

  const teamIds = await resolveTeamIdsFromTokenScopes(created.scopes, user.id)
  await logAuditForTeams(event, teamIds, {
    action: 'token.create',
    resourceType: 'token',
    resourceId: created.id,
    metadata: {
      name: created.name,
      prefix: created.prefix,
      expiresAt: created.expiresAt,
      scopes: created.scopes,
      source: 'cli-device-flow',
    },
  })

  await db.update(cliDeviceAuth)
    .set({
      status: 'approved',
      userId: user.id,
      tokenId: created.id,
      accessToken: token,
    })
    .where(eq(cliDeviceAuth.id, row.id))

  if (!user.cliInstalled) {
    await db.update(schema.users)
      .set({ cliInstalled: true })
      .where(eq(schema.users.id, user.id))
  }

  return { approved: true }
}

export async function denyDeviceAuth(userCode: string) {
  await expireStalePending()
  const row = await findByUserCode(userCode)
  if (!row || row.status !== 'pending') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid or expired authorization request' })
  }
  assertNotExpired(row)

  await db.update(cliDeviceAuth)
    .set({ status: 'denied' })
    .where(eq(cliDeviceAuth.id, row.id))

  return { denied: true }
}

export async function pollDeviceAuthToken(event: H3Event, deviceCode: string) {
  const ip = getClientIp(event)
  const rate = checkRateLimit(pollAttempts, ip, DEVICE_POLL_RATE_LIMIT)
  if (!rate.allowed) {
    throw createError({ statusCode: 429, statusMessage: 'Too many polling attempts. Try again later.' })
  }

  await expireStalePending()

  const row = await findByDeviceCode(deviceCode)
  if (!row) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid device code' })
  }

  if (row.expiresAt.getTime() < Date.now() && row.status === 'pending') {
    await db.update(cliDeviceAuth).set({ status: 'expired' }).where(eq(cliDeviceAuth.id, row.id))
    throw createError({ statusCode: 400, statusMessage: 'Device authorization expired' })
  }

  if (row.status === 'denied') {
    throw createError({ statusCode: 403, statusMessage: 'Device authorization denied' })
  }

  if (row.status === 'expired') {
    throw createError({ statusCode: 400, statusMessage: 'Device authorization expired' })
  }

  if (row.status === 'pending') {
    return { status: 'pending' as const }
  }

  if (row.status === 'approved' && row.accessToken) {
    const { accessToken } = row
    await db.update(cliDeviceAuth)
      .set({ accessToken: null })
      .where(eq(cliDeviceAuth.id, row.id))

    return {
      status: 'approved' as const,
      access_token: accessToken,
    }
  }

  throw createError({ statusCode: 400, statusMessage: 'Device authorization already consumed' })
}

export function verifyDeviceCodeHash(storedHash: string, deviceCode: string): boolean {
  const hash = hashDeviceCode(deviceCode)
  if (storedHash.length !== hash.length) return false
  try {
    return timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(hash, 'hex'))
  } catch {
    return safeEqualHex(storedHash, hash)
  }
}
