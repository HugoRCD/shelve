import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, readFileSync, rmSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setup, url } from '@nuxt/test-utils/e2e'
import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import { seedUser, authedFetch, getCliAuthToken } from './helpers'

describe('Team → Project → Variables E2E flow', async () => {
  await setup({
    env: {
      NUXT_TEST_SEED: '1',
    },
  })

  let api: ReturnType<typeof authedFetch>
  let sessionCookie: string
  let teamSlug: string
  let projectId: number
  let environmentIds: number[]
  let variableId: number
  let cliToken: string
  let cliTmpDir: string | undefined

  const cliEntry = fileURLToPath(new URL('../../../../packages/cli/dist/index.mjs', import.meta.url))
  const shelveUrl = () => new URL(url('/')).origin

  function runCli(args: string[]) {
    execFileSync(process.execPath, [cliEntry, ...args], {
      cwd: cliTmpDir,
      env: {
        ...process.env,
        SHELVE_URL: shelveUrl(),
        SHELVE_TOKEN: cliToken,
        SHELVE_TEAM_SLUG: teamSlug,
        SHELVE_PROJECT: 'my app',
        SHELVE_DEFAULT_ENV: 'development',
        CI: '1',
      },
      stdio: 'pipe',
    })
  }

  beforeAll(async () => {
    const { cookie } = await seedUser({
      username: 'e2e-user',
      email: 'e2e@shelve.cloud',
    })
    sessionCookie = cookie
    api = authedFetch(cookie)
  })

  afterAll(() => {
    if (cliTmpDir)
      rmSync(cliTmpDir, { recursive: true, force: true })
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

  // ─── CLI (same Nuxt server + DB) ───

  test('CLI push uploads variables', async () => {
    cliToken = await getCliAuthToken(sessionCookie)
    cliTmpDir = mkdtempSync(join(tmpdir(), 'shelve-cli-e2e-'))

    writeFileSync(
      join(cliTmpDir, 'package.json'),
      JSON.stringify({ name: 'cli-e2e' }),
    )

    writeFileSync(
      join(cliTmpDir, 'shelve.json'),
      JSON.stringify({
        project: 'my app',
        slug: 'e2e-team',
      }),
    )

    writeFileSync(join(cliTmpDir, '.env'), 'CLI_E2E=hello-from-push\n')

    runCli(['push'])

    const variables = await api(`/api/teams/${teamSlug}/projects/${projectId}/variables`)

    const row = variables.find((v: { key: string }) => v.key === 'CLI_E2E')
    expect(row).toBeDefined()
    expect(
      row!.values.some((x: { value: string }) => x.value === 'hello-from-push'),
    ).toBe(true)
  })

  test('CLI pull writes .env from remote', () => {
    unlinkSync(join(cliTmpDir!, '.env'))

    runCli(['pull'])

    const content = readFileSync(join(cliTmpDir!, '.env'), 'utf-8')

    expect(content).toContain('# Generated by Shelve CLI')
    expect(content).toContain('CLI_E2E=hello-from-push')
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
