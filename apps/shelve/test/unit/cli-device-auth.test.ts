import { createHash, randomBytes } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, test, expect, vi } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { asc } from 'drizzle-orm'
import * as schema from '../../server/db/schema'
import { getDeviceAuthStatus, verifyDeviceCodeHash } from '../../server/services/cli-device-auth'

const client = new PGlite()
const migrationsDir = join(__dirname, '../../server/db/migrations/postgresql')
for (const file of readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()) {
  for (const statement of readFileSync(join(migrationsDir, file), 'utf-8').split('--> statement-breakpoint')) {
    if (statement.trim()) await client.exec(statement)
  }
}
const db = drizzle(client, { schema })
vi.stubGlobal('db', db)

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

describe('expired device requests', () => {
  test('lose the token value the CLI never collected', async () => {
    const past = new Date(Date.now() - 60_000)
    const future = new Date(Date.now() + 60_000)
    await db.insert(schema.cliDeviceAuth).values([
      { deviceCodeHash: hashDeviceCode('stale'), userCode: 'AAAA-AAAA', status: 'approved', accessToken: 'she_stale', expiresAt: past },
      { deviceCodeHash: hashDeviceCode('fresh'), userCode: 'BBBB-BBBB', status: 'approved', accessToken: 'she_fresh', expiresAt: future },
      { deviceCodeHash: hashDeviceCode('pending'), userCode: 'CCCC-CCCC', status: 'pending', expiresAt: past },
    ])

    await getDeviceAuthStatus('BBBB-BBBB')

    const rows = await db
      .select({ userCode: schema.cliDeviceAuth.userCode, status: schema.cliDeviceAuth.status, accessToken: schema.cliDeviceAuth.accessToken })
      .from(schema.cliDeviceAuth)
      .orderBy(asc(schema.cliDeviceAuth.userCode))
    expect(rows).toEqual([
      { userCode: 'AAAA-AAAA', status: 'approved', accessToken: null },
      { userCode: 'BBBB-BBBB', status: 'approved', accessToken: 'she_fresh' },
      { userCode: 'CCCC-CCCC', status: 'expired', accessToken: null },
    ])
  })
})
