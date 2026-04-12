import { sql } from 'drizzle-orm'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export default defineNitroPlugin(async () => {
  if (!process.env.NUXT_TEST_SEED) return

  const serverDir = dirname(fileURLToPath(import.meta.url))
  const candidates = [
    join(serverDir, 'db/migrations/postgresql'),
    join(serverDir, '../db/migrations/postgresql'),
    join(process.cwd(), 'server/db/migrations/postgresql'),
  ]

  const migrationsDir = candidates.find(d => existsSync(d))
  if (!migrationsDir) {
    console.warn('[test-migrations] Could not find migrations directory, tried:', candidates)
    return
  }

  const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()

  for (const file of files) {
    const content = readFileSync(join(migrationsDir, file), 'utf-8')
    const statements = content.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean)
    for (const statement of statements) {
      try {
        await db.execute(sql.raw(statement))
      } catch {
        // Ignore errors for already-existing objects (enum already exists, etc.)
      }
    }
  }
})
