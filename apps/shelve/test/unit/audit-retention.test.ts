import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { lt } from 'drizzle-orm'
import type { H3Event } from 'h3'
import * as schema from '../../server/db/schema'

const client = new PGlite()
const migrationsDir = join(__dirname, '../../server/db/migrations/postgresql')
for (const file of readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()) {
  for (const statement of readFileSync(join(migrationsDir, file), 'utf-8').split('--> statement-breakpoint')) {
    if (statement.trim()) await client.exec(statement)
  }
}
const db = drizzle(client, { schema })
const runtimeConfig = { private: { auditRetentionDays: 30 as number } }
vi.stubGlobal('db', db)
vi.stubGlobal('schema', schema)
vi.stubGlobal('lt', lt)
vi.stubGlobal('useRuntimeConfig', () => runtimeConfig)
vi.stubGlobal('getAuth', () => Promise.resolve(null))
vi.stubGlobal('getClientIp', () => null)
vi.stubGlobal('getRequestHeader', () => undefined)

const DAY = 24 * 60 * 60 * 1000
const MINUTE = 60 * 1000

async function insertEntry(action: string, createdAt: Date) {
  await db.insert(schema.auditLogs).values({ actorType: 'system', action, createdAt })
}

async function remainingActions() {
  const rows = await db.select({ action: schema.auditLogs.action }).from(schema.auditLogs)
  return rows.map(row => row.action).sort()
}

// A fresh module for each test, so the once-an-hour guard starts unset.
async function loadAudit() {
  vi.resetModules()
  return await import('../../server/services/audit')
}

describe('audit log retention', () => {
  beforeEach(async () => {
    await db.delete(schema.auditLogs)
    runtimeConfig.private.auditRetentionDays = 30
  })

  test('deletes entries older than the window and keeps the rest', async () => {
    const now = new Date()
    await insertEntry('just-expired', new Date(now.getTime() - 30 * DAY - MINUTE))
    await insertEntry('almost-expired', new Date(now.getTime() - 30 * DAY + MINUTE))
    await insertEntry('89-days', new Date(now.getTime() - 89 * DAY))
    await insertEntry('91-days', new Date(now.getTime() - 91 * DAY))

    const { pruneAuditLogs } = await loadAudit()

    expect(await pruneAuditLogs(90, now)).toBe(1)
    expect(await remainingActions()).toEqual(['89-days', 'almost-expired', 'just-expired'])

    expect(await pruneAuditLogs(30, now)).toBe(2)
    expect(await remainingActions()).toEqual(['almost-expired'])
  })

  test('logging an event deletes expired entries', async () => {
    await insertEntry('expired', new Date(Date.now() - 31 * DAY))
    const { logAudit } = await loadAudit()

    await logAudit({} as H3Event, { action: 'project.update' })

    expect(await remainingActions()).toEqual(['project.update'])
  })

  test('a retention of 0 keeps every entry', async () => {
    runtimeConfig.private.auditRetentionDays = 0
    await insertEntry('expired', new Date(Date.now() - 365 * DAY))
    const { logAudit } = await loadAudit()

    await logAudit({} as H3Event, { action: 'project.update' })

    expect(await remainingActions()).toEqual(['expired', 'project.update'])
  })
})
