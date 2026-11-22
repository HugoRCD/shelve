import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { and, eq } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { AuthType, Role } from '@types'
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
vi.stubGlobal('createError', (opts: { statusCode: number; statusMessage: string }) => Object.assign(new Error(opts.statusMessage), opts))
vi.stubGlobal('useRuntimeConfig', () => ({ private: { adminEmails: 'admin@shelve.cloud' } }))
vi.stubGlobal('EmailService', class {

  sendWelcomeEmail() {
    return Promise.resolve()
  }

})

const { handleEmailUser, handleOAuthUser } = await import('../../server/services/user')

const event = {} as H3Event

function githubLogin(email: string, emailVerified: boolean, providerAccountId = '4242') {
  return handleOAuthUser({
    email,
    emailVerified,
    username: 'octocat',
    authType: AuthType.GITHUB,
    providerAccountId,
  }, event)
}

async function linkedAccounts() {
  return await db.select().from(schema.accounts)
}

describe('handleOAuthUser', () => {
  beforeEach(async () => {
    await db.delete(schema.users)
    await db.insert(schema.users).values({ username: 'alice', email: 'alice@shelve.cloud', authType: AuthType.EMAIL })
  })

  test('an unverified email does not attach to the user who owns that email', async () => {
    expect(await githubLogin('alice@shelve.cloud', false)).toBeNull()
    expect(await linkedAccounts()).toHaveLength(0)
  })

  test('a verified email attaches to the user who owns that email', async () => {
    const [alice] = await db.select().from(schema.users).where(eq(schema.users.email, 'alice@shelve.cloud'))
    const user = await githubLogin('alice@shelve.cloud', true)
    expect(user?.id).toBe(alice!.id)
    expect(await linkedAccounts()).toMatchObject([{ userId: alice!.id, provider: AuthType.GITHUB, providerAccountId: '4242' }])
  })

  test('an unverified email does not create a user, admin or not', async () => {
    expect(await githubLogin('admin@shelve.cloud', false)).toBeNull()
    expect(await githubLogin('new@shelve.cloud', false, '4343')).toBeNull()
    expect(await db.select().from(schema.users)).toHaveLength(1)
  })

  test('a verified email creates the user, and grants admin to an admin email', async () => {
    const user = await githubLogin('admin@shelve.cloud', true)
    expect(user).toMatchObject({ email: 'admin@shelve.cloud', role: Role.ADMIN })
  })

  test('an already linked provider account signs in whatever its email status', async () => {
    const alice = await githubLogin('alice@shelve.cloud', true)
    const user = await githubLogin('changed@example.com', false)
    expect(user?.id).toBe(alice!.id)
  })
})

describe('handleEmailUser', () => {
  beforeEach(async () => {
    await db.delete(schema.users)
    await db.insert(schema.users).values({ username: 'alice', email: 'alice@shelve.cloud', authType: AuthType.EMAIL })
  })

  test('signs up an email whose name is already a username, under another username', async () => {
    const { user, isNewUser } = await handleEmailUser('alice@example.com', event)
    expect(isNewUser).toBe(true)
    expect(user.username).toMatch(/^alice_#\d+$/)
  })

  test('keeps a long name within the username column', async () => {
    const { user } = await handleEmailUser(`${'a'.repeat(30)}@example.com`, event)
    expect(user.username).toBe('a'.repeat(25))
  })
})
