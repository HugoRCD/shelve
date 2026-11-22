import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { and, eq } from 'drizzle-orm'
import { createError } from 'h3'
import { AuthType, TeamRole } from '@types'
import * as schema from '../../server/db/schema'
import { PUBLIC_USER_COLUMNS } from '../../server/utils/constants'

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
vi.stubGlobal('createError', createError)
vi.stubGlobal('clearCache', vi.fn())
vi.stubGlobal('PUBLIC_USER_COLUMNS', PUBLIC_USER_COLUMNS)

const membersModule = await import('../../server/services/members')

let teamId: number
let memberIds: [number, number]

async function owners() {
  return await db.query.members.findMany({
    where: and(eq(schema.members.teamId, teamId), eq(schema.members.role, TeamRole.OWNER)),
  })
}

describe('MembersService keeps an owner when two owners change at the same time', () => {
  beforeEach(async () => {
    await db.delete(schema.teams)
    await db.delete(schema.users)
    const users = await db.insert(schema.users).values([
      { username: 'owner-a', email: 'a@shelve.cloud', authType: AuthType.EMAIL },
      { username: 'owner-b', email: 'b@shelve.cloud', authType: AuthType.EMAIL },
    ]).returning()
    const [team] = await db.insert(schema.teams).values({ name: 'Owners', slug: 'owners' }).returning()
    teamId = team!.id
    const members = await db.insert(schema.members).values(
      users.map(user => ({ userId: user.id, teamId, role: TeamRole.OWNER })),
    ).returning()
    memberIds = [members[0]!.id, members[1]!.id]
  })

  test('when both step down', async () => {
    const service = new membersModule.MembersService()
    const results = await Promise.allSettled(memberIds.map(memberId =>
      service.updateMember({ teamId, slug: 'owners', memberId, role: TeamRole.MEMBER, currentRole: TeamRole.OWNER })))

    expect(results.map(result => result.status).sort()).toEqual(['fulfilled', 'rejected'])
    expect(await owners()).toHaveLength(1)
  })

  test('when they remove each other', async () => {
    const service = new membersModule.MembersService()
    const results = await Promise.allSettled(memberIds.map(memberId =>
      service.removeMember({ teamId, slug: 'owners', memberId })))

    expect(results.map(result => result.status).sort()).toEqual(['fulfilled', 'rejected'])
    expect(await owners()).toHaveLength(1)
  })
})
