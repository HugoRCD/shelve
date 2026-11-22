import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import * as schema from '../../server/db/schema'

const client = new PGlite()
const migrationsDir = join(__dirname, '../../server/db/migrations/postgresql')
for (const file of readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()) {
  for (const statement of readFileSync(join(migrationsDir, file), 'utf-8').split('--> statement-breakpoint')) {
    if (statement.trim()) await client.exec(statement)
  }
}
const db = drizzle(client, { schema })
vi.stubGlobal('db', db)

const { reserveOTPRequest } = await import('../../server/services/otp')

const allowedCount = async (email: string, times: number) =>
  (await Promise.all(Array.from({ length: times }, () => reserveOTPRequest(email)))).filter(r => r.allowed).length

describe('reserveOTPRequest', () => {
  beforeEach(async () => {
    await db.delete(schema.otpRequests)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('allows three requests an hour for an email without an account, then gives the wait', async () => {
    for (let i = 0; i < 3; i++) expect(await reserveOTPRequest('new@shelve.cloud')).toEqual({ allowed: true })
    expect(await reserveOTPRequest('new@shelve.cloud')).toEqual({ allowed: false, retryAfterMinutes: 60 })
    expect(await reserveOTPRequest('other@shelve.cloud')).toEqual({ allowed: true })
  })

  test('parallel requests cannot take more than the three slots', async () => {
    expect(await allowedCount('race@shelve.cloud', 10)).toBe(3)
  })

  test('starts a new window once the hour has passed', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-01-01T10:00:00Z'))
    expect(await allowedCount('later@shelve.cloud', 4)).toBe(3)
    vi.setSystemTime(new Date('2026-01-01T10:45:00Z'))
    expect(await reserveOTPRequest('later@shelve.cloud')).toEqual({ allowed: false, retryAfterMinutes: 15 })
    vi.setSystemTime(new Date('2026-01-01T11:00:01Z'))
    expect(await allowedCount('later@shelve.cloud', 4)).toBe(3)
  })
})
