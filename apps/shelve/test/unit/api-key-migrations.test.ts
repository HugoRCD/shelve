import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, test, expect } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { defaultKeyHasher } from '@better-auth/api-key'

const migrationsDir = join(__dirname, '../../server/db/migrations/postgresql')
const migrations = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()

async function migrate(client: PGlite, files: string[]) {
  for (const file of files) {
    for (const statement of readFileSync(join(migrationsDir, file), 'utf-8').split('--> statement-breakpoint')) {
      if (statement.trim()) await client.exec(statement)
    }
  }
}

describe('0015_api_key_hashes and 0016_api_key_rename', () => {
  test('tokens created before the api-key plugin become API keys the plugin finds by hash', async () => {
    const client = new PGlite()
    await migrate(client, migrations.filter(f => f < '0015'))

    // Before: Shelve stored sha256(token) as hex.
    const insertHexToken = (token: string, name: string) => client.query(
      `insert into tokens (hash, prefix, name, "userId", scopes, "updatedAt") values ($1, $2, $3, (select id from users), '{"permissions":["read"]}', now())`,
      [createHash('sha256').update(token).digest('hex'), token.slice(0, 12), name],
    )
    const tokens = ['she_0123456789ABCDEFGHJKMNPQRSTVWXYZ', 'she_ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ', 'she_old_token_with_+/_like_bytes']
    await client.exec(`insert into users (username, email, "authType", "updatedAt") values ('owner', 'owner@shelve.cloud', 'email', now())`)
    for (const [i, token] of tokens.entries()) await insertHexToken(token, `token-${i}`)

    await migrate(client, migrations.filter(f => f.startsWith('0015')))
    // An instance still running the previous release saves a hex hash after 0015 ran.
    const lateToken = 'she_LATE0123456789ABCDEFGHJKMNPQRST'
    await insertHexToken(lateToken, 'token-late')
    await migrate(client, migrations.filter(f => f >= '0016'))

    const { rows } = await client.query<{ name: string; key: string; start: string; referenceId: number }>(
      'select name, key, start, "referenceId" from api_keys order by name',
    )
    const all = [...tokens, lateToken]
    expect(rows.map(r => r.key)).toEqual(await Promise.all(all.map(t => defaultKeyHasher(t))))
    expect(rows.map(r => r.start)).toEqual(all.map(t => t.slice(0, 12)))
    const { rows: [owner] } = await client.query<{ id: number }>('select id from users')
    expect(rows.every(r => r.referenceId === owner!.id)).toBe(true)
  })
})
