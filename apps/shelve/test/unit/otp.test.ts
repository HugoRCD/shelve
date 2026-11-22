import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { eq, sql } from 'drizzle-orm'
import { AuthType } from '@types'
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
vi.stubGlobal('eq', eq)
vi.stubGlobal('sql', sql)
vi.mock('../../server/services/user', () => ({ handleEmailUser: vi.fn() }))

const { verifyOTPForUser } = await import('../../server/services/otp')

const email = 'otp@shelve.cloud'
const code = '482913'

describe('verifyOTPForUser', () => {
  beforeEach(async () => {
    await db.delete(schema.users)
    await db.insert(schema.users).values({
      username: 'otp-user',
      email,
      authType: AuthType.EMAIL,
      otpCode: code,
      otpToken: 'link-token',
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    })
  })

  test('accepts the right code once', async () => {
    expect((await verifyOTPForUser(email, '000000')).success).toBe(false)
    expect((await verifyOTPForUser(email, code)).success).toBe(true)
    expect((await verifyOTPForUser(email, code)).success).toBe(false)
  })

  test('refuses the right code after five wrong ones', async () => {
    for (const guess of ['000000', '111111', '222222', '333333', '444444'])
      expect((await verifyOTPForUser(email, guess)).success).toBe(false)

    expect((await verifyOTPForUser(email, code)).success).toBe(false)
  })

  test('counts guesses sent in parallel', async () => {
    const guesses = Array.from({ length: 50 }, (_, i) => String(100000 + i))
    await Promise.all(guesses.map(guess => verifyOTPForUser(email, guess)))

    expect((await verifyOTPForUser(email, code)).success).toBe(false)
    const [user] = await db.select({ attempts: schema.users.otpVerifyAttempts }).from(schema.users)
    expect(user!.attempts).toBe(5)
  })
})
