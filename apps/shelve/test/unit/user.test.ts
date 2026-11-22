import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { and, eq } from 'drizzle-orm'
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
vi.stubGlobal('schema', schema)
vi.stubGlobal('eq', eq)
vi.stubGlobal('and', and)

const { availableUsername } = await import('../../server/services/user')

describe('availableUsername', () => {
  beforeEach(async () => {
    await db.delete(schema.users)
    await db.insert(schema.users).values({ username: 'alice', email: 'alice@shelve.cloud', authType: AuthType.EMAIL })
  })

  test('keeps a free name, with spaces turned into underscores', async () => {
    expect(await availableUsername(' Ada Lovelace ')).toBe('Ada_Lovelace')
  })

  test('gives a name that is already a username another username', async () => {
    expect(await availableUsername('alice')).toMatch(/^alice_#\d+$/)
  })

  test('skips a generated username that is also taken', async () => {
    await db.insert(schema.users).values({ username: 'alice_#123', email: 'alice123@shelve.cloud', authType: AuthType.EMAIL })
    const random = vi.spyOn(Math, 'random').mockReturnValueOnce(0.123).mockReturnValueOnce(0.456)
    try {
      expect(await availableUsername('alice')).toBe('alice_#456')
    } finally {
      random.mockRestore()
    }
  })

  test('keeps a long name, and its suffixed variant, within the username column', async () => {
    const long = 'a'.repeat(30)
    expect(await availableUsername(long)).toBe('a'.repeat(25))
    await db.insert(schema.users).values({ username: 'a'.repeat(25), email: 'long@shelve.cloud', authType: AuthType.EMAIL })
    expect((await availableUsername(long)).length).toBeLessThanOrEqual(25)
  })
})
