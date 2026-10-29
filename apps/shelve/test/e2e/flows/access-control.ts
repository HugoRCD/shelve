import { url, fetch } from '@nuxt/test-utils/e2e'
import { test, expect } from 'vitest'
import type { TokenScopes } from '@types'
import type { E2EContext } from '../helpers'
import { authedFetch, seedUser } from '../helpers'

type Team = { id: number; slug: string; members: { id: number; role: string; user: { email: string } }[] }
type Project = { id: number; name: string; teamId: number }
type Environment = { id: number; name: string }
type Variable = { key: string; values: { environmentId: number; value: string }[] }

function withToken(token: string, path: string, init: { method?: string; body?: unknown } = {}) {
  return fetch(url(path), {
    method: init.method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  })
}

export function registerAccessControlTests(ctx: E2EContext) {
  const intruderEmail = 'e2e-intruder@shelve.cloud'
  let team: Team
  let otherTeam: Team
  let otherProject: Project
  let environments: Environment[]
  let intruder: ReturnType<typeof authedFetch>
  let intruderTeamSlug: string

  async function createToken(name: string, scopes: TokenScopes): Promise<string> {
    const created = await ctx.api<{ token: string }>('/api/tokens', {
      method: 'POST',
      body: { name, scopes },
    })
    return created.token
  }

  test('setup: a second team with its own project', async () => {
    team = await ctx.api<Team>(`/api/teams/${ctx.teamSlug}`)
    otherTeam = await ctx.api<Team>('/api/teams', { method: 'POST', body: { name: 'E2E Other' } })
    otherProject = await ctx.api<Project>(`/api/teams/${otherTeam.slug}/projects`, {
      method: 'POST',
      body: { name: 'Other App' },
    })
    environments = await ctx.api<Environment[]>(`/api/teams/${ctx.teamSlug}/environments`)
  })

  test('a token restricted to one team cannot read another team', async () => {
    const token = await createToken('one-team-read', { permissions: ['read'], teamIds: [team.id] })

    const projects = await withToken(token, `/api/teams/${otherTeam.slug}/projects`)
    expect(projects.status).toBe(403)

    const environment = await withToken(token, `/api/teams/${otherTeam.slug}/environments/development`)
    expect(environment.status).toBe(403)

    const project = await withToken(token, `/api/teams/${otherTeam.slug}/projects/${otherProject.id}`)
    expect(project.status).toBe(403)

    const own = await withToken(token, `/api/teams/${ctx.teamSlug}/projects`)
    expect(own.status).toBe(200)
  })

  test('a token restricted to one team only lists that team', async () => {
    const token = await createToken('one-team-list', { permissions: ['read'], teamIds: [team.id] })
    const res = await withToken(token, '/api/teams')
    expect(res.status).toBe(200)
    const teams = await res.json() as Team[]
    expect(teams.map(t => t.id)).toEqual([team.id])
  })

  test('a read-only token cannot create a project', async () => {
    const token = await createToken('read-only', { permissions: ['read'], teamIds: [team.id] })

    const res = await withToken(token, `/api/teams/${ctx.teamSlug}/projects`, {
      method: 'POST',
      body: { name: 'Should Not Exist' },
    })
    expect(res.status).toBe(403)

    const projects = await ctx.api<Project[]>(`/api/teams/${ctx.teamSlug}/projects`)
    expect(projects.some(p => p.name === 'Should Not Exist')).toBe(false)
  })

  test('a token restricted to one project only sees that project', async () => {
    const token = await createToken('one-project', { permissions: ['read', 'write'], projectIds: [ctx.projectId] })

    const list = await withToken(token, `/api/teams/${ctx.teamSlug}/projects`)
    expect(list.status).toBe(200)
    const projects = await list.json() as Project[]
    expect(projects.map(p => p.id)).toEqual([ctx.projectId])

    const otherTeamRes = await withToken(token, `/api/teams/${otherTeam.slug}/environments`)
    expect(otherTeamRes.status).toBe(403)

    const create = await withToken(token, `/api/teams/${ctx.teamSlug}/projects`, {
      method: 'POST',
      body: { name: 'Out Of Scope' },
    })
    expect(create.status).toBe(403)

    const auditLogs = await withToken(token, `/api/teams/${ctx.teamSlug}/audit-logs`)
    expect(auditLogs.status).toBe(403)
  })

  test('a token restricted to one environment only reads that environment', async () => {
    const [allowed, denied] = environments
    const token = await createToken('one-env', { permissions: ['read'], environmentIds: [allowed!.id] })

    const variablesRes = await withToken(token, `/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variables`)
    expect(variablesRes.status).toBe(200)
    const variables = await variablesRes.json() as Variable[]
    expect(variables.length).toBeGreaterThan(0)
    for (const variable of variables) {
      for (const value of variable.values) expect(value.environmentId).toBe(allowed!.id)
    }

    const deniedEnv = await withToken(token, `/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variables/env/${denied!.id}`)
    expect(deniedEnv.status).toBe(403)

    const envList = await withToken(token, `/api/teams/${ctx.teamSlug}/environments`)
    const envs = await envList.json() as Environment[]
    expect(envs.map(e => e.id)).toEqual([allowed!.id])
  })

  test('a token cannot create or list tokens', async () => {
    const token = await createToken('full-access', { permissions: ['read', 'write'] })

    const create = await withToken(token, '/api/tokens', {
      method: 'POST',
      body: { name: 'minted-by-token' },
    })
    expect(create.status).toBe(403)

    const list = await withToken(token, '/api/tokens')
    expect(list.status).toBe(403)
  })

  test('the session of a token request cannot be replayed as a cookie', async () => {
    const token = await createToken('cookie-replay', { permissions: ['read'], teamIds: [team.id] })
    const res = await withToken(token, '/api/user/me')
    expect(res.status).toBe(200)

    // h3 issues an empty session cookie to any request without one; it must not hold the token's session.
    const cookie = res.headers.getSetCookie().map(c => c.split(';')[0]).join('; ')
    const session = await fetch(url('/api/_auth/session'), { headers: { Cookie: cookie } })
    expect(session.status).toBe(200)
    expect(await session.json()).not.toHaveProperty('user')

    const replay = await fetch(url('/api/user/me'), { headers: { Cookie: cookie } })
    expect(replay.status).toBe(401)
  })

  test('setup: an intruder who is a member of the team and owns another team', async () => {
    const seeded = await seedUser({ username: 'e2e-intruder', email: intruderEmail })
    intruder = authedFetch(seeded.cookie)
    await ctx.api(`/api/teams/${ctx.teamSlug}/members`, {
      method: 'POST',
      body: { email: intruderEmail, role: 'member' },
    })
    const intruderTeam = await intruder<Team>('/api/teams', { method: 'POST', body: { name: 'E2E Intruder' } })
    intruderTeamSlug = intruderTeam.slug
  })

  test('team responses never include one-time login codes', async () => {
    const teams = [
      await ctx.api<Team>(`/api/teams/${ctx.teamSlug}`),
      ...await ctx.api<Team[]>('/api/teams'),
    ]
    for (const { members } of teams) {
      for (const { user } of members) {
        expect(user).not.toHaveProperty('otpCode')
        expect(user).not.toHaveProperty('otpToken')
      }
    }
  })

  test('looking a team up by slug requires being a member', async () => {
    await expect(intruder(`/api/teams?slug=${otherTeam.slug}`)).rejects.toMatchObject({ statusCode: 403 })
  })

  test('an admin of one team cannot change member roles in another team', async () => {
    const before = await ctx.api<Team>(`/api/teams/${ctx.teamSlug}`)
    const membership = before.members.find(m => m.user.email === intruderEmail)!

    await expect(intruder(`/api/teams/${intruderTeamSlug}/members/${membership.id}`, {
      method: 'PUT',
      body: { role: 'owner' },
    })).rejects.toMatchObject({ statusCode: 404 })

    const after = await ctx.api<Team>(`/api/teams/${ctx.teamSlug}`)
    expect(after.members.find(m => m.id === membership.id)?.role).toBe('member')
  })

  test('an admin of one team cannot rename environments of another team', async () => {
    const target = environments[0]!
    await expect(intruder(`/api/teams/${intruderTeamSlug}/environments/${target.id}`, {
      method: 'PUT',
      body: { name: 'hijacked' },
    })).rejects.toMatchObject({ statusCode: 404 })

    const envs = await ctx.api<Environment[]>(`/api/teams/${ctx.teamSlug}/environments`)
    expect(envs.find(e => e.id === target.id)?.name).toBe(target.name)
  })

  test('cleanup: remove the extra teams', async () => {
    await intruder(`/api/teams/${intruderTeamSlug}`, { method: 'DELETE' })
    await ctx.api(`/api/teams/${otherTeam.slug}`, { method: 'DELETE' })
  })
}
