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

describe('0015_api_key_hashes', () => {
  test('a token created before the api-key plugin is found by the plugin\'s hash after the migration', async () => {
    const client = new PGlite()
    await migrate(client, migrations.filter(f => f < '0015'))

    // Before: Shelve stored sha256(token) as hex.
    const tokens = ['she_0123456789ABCDEFGHJKMNPQRSTVWXYZ', 'she_ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ', 'she_old_token_with_+/_like_bytes']
    await client.exec(`insert into users (username, email, "authType", "updatedAt") values ('owner', 'owner@shelve.cloud', 'email', now())`)
    for (const [i, token] of tokens.entries()) {
      const hex = createHash('sha256').update(token).digest('hex')
      await client.query(
        `insert into tokens (hash, prefix, name, "userId", scopes, "updatedAt") values ($1, $2, $3, (select id from users), '{"permissions":["read"]}', now())`,
        [hex, token.slice(0, 12), `token-${i}`],
      )
    }

    await migrate(client, migrations.filter(f => f >= '0015'))

    const { rows } = await client.query<{ name: string; hash: string }>('select name, hash from tokens order by name')
    expect(rows.map(r => r.hash)).toEqual(await Promise.all(tokens.map(t => defaultKeyHasher(t))))

    // Running it again changes nothing.
    await migrate(client, migrations.filter(f => f >= '0015'))
    const again = await client.query<{ hash: string }>('select hash from tokens order by name')
    expect(again.rows.map(r => r.hash)).toEqual(rows.map(r => r.hash))
  })
})
