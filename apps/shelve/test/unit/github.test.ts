import { generateKeyPairSync, randomBytes } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { and, eq } from 'drizzle-orm'
import jwt from 'jsonwebtoken'
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

const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
})
const APP_CLIENT_ID = 'Iv1.shelve-test'
const USER_TOKEN = 'user-token'

/** Stands in for Nitro's cachedFunction: one shared store, keyed like Nitro keys it. */
const cache = new Map<string, unknown>()
vi.stubGlobal('cachedFunction', (fn: (...args: any[]) => Promise<unknown>, opts: { name?: string; getKey?: (...args: any[]) => string } = {}) =>
  async (...args: any[]) => {
    const key = `${opts.name}:${opts.getKey ? opts.getKey(...args) : JSON.stringify(args)}`
    if (!cache.has(key)) cache.set(key, await fn(...args))
    return cache.get(key)
  })
vi.stubGlobal('createError', (opts: { statusCode: number; statusMessage: string; data?: unknown }) =>
  Object.assign(new Error(opts.statusMessage), opts))
vi.stubGlobal('useRuntimeConfig', () => ({
  private: { github: { privateKey: Buffer.from(privateKey).toString('base64') } },
  oauth: { github: { clientId: APP_CLIENT_ID } },
}))
vi.stubGlobal('db', db)
vi.stubGlobal('schema', schema)
vi.stubGlobal('eq', eq)
vi.stubGlobal('and', and)

type FakeRepo = { id: number; fullName: string; installation: number; admin: boolean }

// The user is a read-only member of acme, whose installation (22) they linked first, and owns installation 11.
const repos: FakeRepo[] = [
  { id: 2, fullName: 'acme/api', installation: 22, admin: false },
  { id: 3, fullName: 'acme/web', installation: 22, admin: true },
  ...Array.from({ length: 98 }, (_, i) => ({ id: 100 + i, fullName: `acme/docs-${i}`, installation: 22, admin: false })),
  // Only on the second page of installation 22.
  { id: 5, fullName: 'acme/last', installation: 22, admin: true },
  { id: 1, fullName: 'me/tool', installation: 11, admin: true },
  // Installed by someone else, and never linked by the user.
  { id: 4, fullName: 'other/app', installation: 33, admin: true },
]

function toGithubRepo(repo: FakeRepo) {
  return {
    id: repo.id,
    name: repo.fullName.split('/')[1],
    full_name: repo.fullName,
    html_url: `https://github.com/${repo.fullName}`,
    permissions: { admin: repo.admin, push: repo.admin, pull: true },
  }
}

type Call = { method: string; path: string; auth: string; body?: any }
const calls: Call[] = []
/** Installation tokens the fake GitHub issued, with what each may reach. */
const issued = new Map<string, { installation: number; repositoryIds?: number[]; permissions?: unknown }>()
const publicKey = randomBytes(32).toString('base64')

function fail(status: number): never {
  throw Object.assign(new Error(`GitHub answered ${status}`), { response: { status } })
}

function isAppJwt(auth: string) {
  return (jwt.decode(auth.replace('Bearer ', '')) as { iss?: string } | null)?.iss === APP_CLIENT_ID
}

function github(method: string, path: string, auth: string, options: { query?: Record<string, number>; body?: any }) {
  let match: RegExpMatchArray | null
  if (method === 'GET' && (match = path.match(/^\/user\/installations\/(\d+)\/repositories$/))) {
    if (auth !== `Bearer ${USER_TOKEN}`) fail(401)
    const { page = 1, per_page: perPage = 30 } = options.query ?? {}
    const listed = repos.filter(repo => repo.installation === Number(match![1]))
    return { total_count: listed.length, repositories: listed.slice((page - 1) * perPage, page * perPage).map(toGithubRepo) }
  }
  if (method === 'GET' && path === '/installation/repositories') {
    const token = issued.get(auth.replace('Bearer ', '')) ?? fail(401)
    return { repositories: repos.filter(repo => repo.installation === token.installation).slice(0, 100).map(toGithubRepo) }
  }
  if (method === 'POST' && (match = path.match(/^\/app\/installations\/(\d+)\/access_tokens$/))) {
    if (!isAppJwt(auth)) fail(401)
    const token = `installation-token-${issued.size + 1}`
    issued.set(token, { installation: Number(match[1]), repositoryIds: options.body?.repository_ids, permissions: options.body?.permissions })
    return { token, expires_at: new Date(Date.now() + 3600_000).toISOString() }
  }
  if (method === 'GET' && (match = path.match(/^\/repos\/([^/]+\/[^/]+)\/installation$/))) {
    if (!isAppJwt(auth)) fail(401)
    const repo = repos.find(r => r.fullName === match![1]) ?? fail(404)
    return { id: repo.installation }
  }
  if (match = path.match(/^\/repos\/([^/]+\/[^/]+)\/actions\/secrets\/([\w-]+)$/)) {
    const token = issued.get(auth.replace('Bearer ', ''))
    const repo = repos.find(r => r.fullName === match![1])
    if (!token || !repo || token.installation !== repo.installation) fail(404)
    if (token.repositoryIds && !token.repositoryIds.includes(repo.id)) fail(404)
    if (method === 'GET' && match[2] === 'public-key') return { key_id: 'key-1', key: publicKey }
    if (method === 'PUT') return undefined
  }
  if (method === 'GET' && (match = path.match(/^\/repos\/([^/]+\/[^/]+)$/))) {
    if (auth === 'Bearer expired-token') fail(401)
    const repo = repos.find(r => r.fullName === match![1]) ?? fail(404)
    return toGithubRepo(repo)
  }
  throw new Error(`Unexpected GitHub call: ${method} ${path}`)
}

vi.stubGlobal('$fetch', vi.fn((url: string, options: { method?: string; headers?: Record<string, string>; query?: any; body?: any } = {}) => {
  const { pathname } = new URL(url)
  const call = { method: options.method ?? 'GET', path: pathname, auth: options.headers?.Authorization ?? '', body: options.body }
  calls.push(call)
  // A failed call rejects, as $fetch does.
  return new Promise(resolve => resolve(github(call.method, call.path, call.auth, { query: options.query ?? Object.fromEntries(new URL(url).searchParams), body: options.body })))
}))

const githubModule = await import('../../server/services/github')

const [user] = await db.insert(schema.users).values({ username: 'gh-user', email: 'gh@shelve.cloud', authType: AuthType.GITHUB }).returning()
const [otherUser] = await db.insert(schema.users).values({ username: 'gh-other', email: 'gh-other@shelve.cloud', authType: AuthType.GITHUB }).returning()
await db.insert(schema.githubApp).values({ installationId: 22, userId: user!.id })
await db.insert(schema.githubApp).values({ installationId: 11, userId: user!.id })
await db.insert(schema.githubApp).values({ installationId: 33, userId: otherUser!.id })

const secrets = [{ key: 'API_KEY', value: 's3cret' }]
const service = () => new githubModule.GithubService({} as any)
const mints = () => calls.filter(c => c.path.endsWith('/access_tokens'))
const writes = () => calls.filter(c => c.method === 'PUT')

describe('GitHub repositories', () => {
  beforeEach(() => {
    calls.length = 0
    issued.clear()
    cache.clear()
  })

  test('lists only repositories the user administers, as GitHub lists them for the user', async () => {
    const listed = await service().getUserRepos({} as any, user!.id, USER_TOKEN)

    expect(listed.map(r => r.full_name).sort()).toEqual(['acme/last', 'acme/web', 'me/tool'])
    expect(calls.every(c => c.auth === `Bearer ${USER_TOKEN}`)).toBe(true)
    expect(calls.map(c => c.path)).toEqual([
      '/user/installations/22/repositories',
      '/user/installations/22/repositories',
      '/user/installations/11/repositories',
    ])
  })
})

describe('pushing secrets to GitHub', () => {
  beforeEach(() => {
    calls.length = 0
    issued.clear()
    cache.clear()
  })

  test('refuses a repository the user can read but not administer', async () => {
    await expect(service().sendSecrets(user!.id, 'https://github.com/acme/api', secrets, USER_TOKEN))
      .rejects.toMatchObject({ statusCode: 403 })

    expect(calls.find(c => c.path === '/repos/acme/api')?.auth).toBe(`Bearer ${USER_TOKEN}`)
    expect(mints()).toEqual([])
    expect(writes()).toEqual([])
  })

  test('writes with a token restricted to the repository, from the installation that covers it', async () => {
    await service().sendSecrets(user!.id, 'https://github.com/me/tool', secrets, USER_TOKEN)

    expect(calls.find(c => c.path === '/repos/me/tool')?.auth).toBe(`Bearer ${USER_TOKEN}`)
    // Installation 11 covers the repository, even though the user linked installation 22 first.
    expect(mints()).toMatchObject([
      {
        path: '/app/installations/11/access_tokens',
        body: { repository_ids: [1], permissions: { secrets: 'write' } },
      }
    ])
    expect(writes()).toHaveLength(1)
    expect(writes()[0]).toMatchObject({ path: '/repos/me/tool/actions/secrets/API_KEY' })
    expect(issued.get(writes()[0]!.auth.replace('Bearer ', ''))).toEqual({
      installation: 11,
      repositoryIds: [1],
      permissions: { secrets: 'write' },
    })
    expect(writes()[0]!.body.encrypted_value).not.toContain('s3cret')
    // The user's own token only reads.
    expect(calls.filter(c => c.auth === `Bearer ${USER_TOKEN}`).every(c => c.method === 'GET')).toBe(true)
  })

  test('refuses a repository whose installation the user has not connected', async () => {
    await expect(service().sendSecrets(user!.id, 'other/app', secrets, USER_TOKEN))
      .rejects.toMatchObject({ statusCode: 404 })
    expect(mints()).toEqual([])
  })

  test('refuses a repository GitHub does not show to the user', async () => {
    await expect(service().sendSecrets(user!.id, 'acme/private', secrets, USER_TOKEN))
      .rejects.toMatchObject({ statusCode: 404 })
    expect(mints()).toEqual([])
  })

  test('never reuses a token restricted to one repository for another', async () => {
    await service().sendSecrets(user!.id, 'me/tool', secrets, USER_TOKEN)
    await service().sendSecrets(user!.id, 'acme/web', secrets, USER_TOKEN)
    await service().sendSecrets(user!.id, 'me/tool', secrets, USER_TOKEN)

    expect(mints().map(c => [c.path, c.body.repository_ids])).toEqual([
      ['/app/installations/11/access_tokens', [1]],
      ['/app/installations/22/access_tokens', [3]],
    ])
    expect(writes()).toHaveLength(3)
  })

  test('refuses `.` and `..` as repository names before calling GitHub', async () => {
    for (const repository of ['acme/..', 'acme/.', '../acme', 'acme/../web', 'acme']) {
      expect(githubModule.GITHUB_REPOSITORY_PATTERN.test(repository)).toBe(false)
      await expect(service().sendSecrets(user!.id, repository, secrets, USER_TOKEN)).rejects.toMatchObject({ statusCode: 400 })
    }
    for (const repository of ['acme/web', 'acme/.github', 'acme/my.repo', 'me_ent/tool-2'])
      expect(githubModule.GITHUB_REPOSITORY_PATTERN.test(repository)).toBe(true)
    expect(calls).toEqual([])
  })

  test('refuses secret names GitHub reserves before calling GitHub', async () => {
    for (const key of ['GITHUB_TOKEN', 'github_sha', 'GitHub_Ref']) {
      expect(githubModule.GITHUB_SECRET_NAME_PATTERN.test(key)).toBe(false)
      await expect(service().sendSecrets(user!.id, 'me/tool', [{ key, value: 'x' }], USER_TOKEN)).rejects.toMatchObject({ statusCode: 400 })
    }
    for (const key of ['API_KEY', 'MY_GITHUB_TOKEN', 'GITHUB', '_GITHUB_X'])
      expect(githubModule.GITHUB_SECRET_NAME_PATTERN.test(key)).toBe(true)
    expect(calls).toEqual([])
  })

  test('asks to sign in with GitHub again when GitHub refuses the user token', async () => {
    await expect(service().sendSecrets(user!.id, 'me/tool', secrets, 'expired-token'))
      .rejects.toMatchObject({ statusCode: 403, data: { reason: 'github-sign-in-required' } })
    expect(mints()).toEqual([])
  })
})

describe('requireGithubToken', () => {
  test('needs a GitHub sign-in', () => {
    expect(() => githubModule.requireGithubToken(undefined))
      .toThrow(expect.objectContaining({ statusCode: 403, data: { reason: 'github-sign-in-required' } }))
    expect(() => githubModule.requireGithubToken(''))
      .toThrow(expect.objectContaining({ statusCode: 403 }))
    expect(githubModule.requireGithubToken(USER_TOKEN)).toBe(USER_TOKEN)
  })
})
