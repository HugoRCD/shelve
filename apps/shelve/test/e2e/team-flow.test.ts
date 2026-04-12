import { describe, test, expect, beforeAll } from 'vitest'
import { setup } from '@nuxt/test-utils/e2e'
import { seedUser, authedFetch } from './helpers'

describe('Team → Project → Variables E2E flow', async () => {
  await setup({
    env: {
      NUXT_TEST_SEED: '1',
    },
  })

  let api: ReturnType<typeof authedFetch>
  let teamSlug: string
  let projectId: number
  let environmentIds: number[]
  let variableId: number

  beforeAll(async () => {
    const { cookie } = await seedUser({
      username: 'e2e-user',
      email: 'e2e@shelve.cloud',
    })
    api = authedFetch(cookie)
  })

  // ─── Team CRUD ───

  test('create a team', async () => {
    const team = await api('/api/teams', {
      method: 'POST',
      body: { name: 'E2E Team' },
    })

    expect(team.name).toBe('E2E Team')
    expect(team.slug).toBe('e2e-team')
    expect(team.members).toHaveLength(1)
    expect(team.members[0].role).toBe('owner')

    teamSlug = team.slug
  })

  test('list teams includes the new team', async () => {
    const teams = await api('/api/teams')

    expect(teams).toBeInstanceOf(Array)
    expect(teams.some((t: any) => t.slug === teamSlug)).toBe(true)
  })

  test('get team by slug', async () => {
    const team = await api(`/api/teams/${teamSlug}`)

    expect(team.slug).toBe(teamSlug)
    expect(team.members).toHaveLength(1)
  })

  // ─── Environments ───

  test('team has default environments', async () => {
    const envs = await api(`/api/teams/${teamSlug}/environments`)

    expect(envs.length).toBeGreaterThanOrEqual(3)
    const names = envs.map((e: any) => e.name)
    expect(names).toContain('development')
    expect(names).toContain('preview')
    expect(names).toContain('production')

    environmentIds = envs.map((e: any) => e.id)
  })

  // ─── Project CRUD ───

  test('create a project', async () => {
    const project = await api(`/api/teams/${teamSlug}/projects`, {
      method: 'POST',
      body: { name: 'My App' },
    })

    expect(project.name).toBe('My App')
    expect(project.teamId).toBeDefined()

    projectId = project.id
  })

  test('list projects includes the new project', async () => {
    const projects = await api(`/api/teams/${teamSlug}/projects`)

    expect(projects).toBeInstanceOf(Array)
    expect(projects.some((p: any) => p.id === projectId)).toBe(true)
  })

  test('get project by id', async () => {
    const project = await api(`/api/teams/${teamSlug}/projects/${projectId}`)

    expect(project.id).toBe(projectId)
    expect(project.name).toBe('My App')
  })

  // ─── Variables CRUD ───

  test('create variables on the project', async () => {
    const result = await api(`/api/teams/${teamSlug}/projects/${projectId}/variables`, {
      method: 'POST',
      body: {
        autoUppercase: true,
        environmentIds,
        variables: [
          { key: 'api_key', value: 'secret-123' },
          { key: 'db_url', value: 'postgres://localhost/test' },
        ],
      },
    })

    expect(result.statusCode).toBe(201)
  })

  test('read variables back (decrypted round-trip)', async () => {
    const variables = await api(`/api/teams/${teamSlug}/projects/${projectId}/variables`)

    expect(variables).toBeInstanceOf(Array)
    expect(variables).toHaveLength(2)

    const keys = variables.map((v: any) => v.key).sort()
    expect(keys).toEqual(['API_KEY', 'DB_URL'])

    const apiKeyVar = variables.find((v: any) => v.key === 'API_KEY')
    expect(apiKeyVar.values.length).toBeGreaterThanOrEqual(1)
    expect(apiKeyVar.values[0].value).toBe('secret-123')

    const dbUrlVar = variables.find((v: any) => v.key === 'DB_URL')
    expect(dbUrlVar.values[0].value).toBe('postgres://localhost/test')

    variableId = apiKeyVar.id
  })

  test('update a variable key and value', async () => {
    const firstEnvId = environmentIds[0]!

    const result = await api(`/api/teams/${teamSlug}/projects/${projectId}/variables/${variableId}`, {
      method: 'PUT',
      body: {
        key: 'API_SECRET',
        autoUppercase: false,
        values: [{ environmentId: firstEnvId, value: 'updated-secret-456' }],
      },
    })

    expect(result.statusCode).toBe(200)

    const variables = await api(`/api/teams/${teamSlug}/projects/${projectId}/variables`)
    const updated = variables.find((v: any) => v.key === 'API_SECRET')
    expect(updated).toBeDefined()
    const updatedVal = updated.values.find((v: any) => v.environmentId === firstEnvId)
    expect(updatedVal.value).toBe('updated-secret-456')
  })

  test('delete a single variable', async () => {
    const result = await api(`/api/teams/${teamSlug}/projects/${projectId}/variables/${variableId}`, {
      method: 'DELETE',
    })

    expect(result.statusCode).toBe(200)

    const variables = await api(`/api/teams/${teamSlug}/projects/${projectId}/variables`)
    expect(variables.find((v: any) => v.id === variableId)).toBeUndefined()
  })

  // ─── Cleanup: delete project and team ───

  test('delete the project', async () => {
    const result = await api(`/api/teams/${teamSlug}/projects/${projectId}`, {
      method: 'DELETE',
    })

    expect(result.statusCode).toBe(200)
  })

  test('delete the team', async () => {
    const result = await api(`/api/teams/${teamSlug}`, {
      method: 'DELETE',
    })

    expect(result.statusCode).toBe(200)
  })
})
