import { test, expect } from 'vitest'
import type { E2EContext } from '../helpers'

export function registerVariableTests(ctx: E2EContext) {
  test('create variables on the project', async () => {
    const result = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variables`, {
      method: 'POST',
      body: {
        autoUppercase: true,
        environmentIds: ctx.environmentIds,
        variables: [
          { key: 'api_key', value: 'secret-123' },
          { key: 'db_url', value: 'postgres://localhost/test' },
        ],
      },
    })

    expect(result.statusCode).toBe(201)
  })

  test('read variables back (decrypted round-trip)', async () => {
    const variables = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variables`)

    expect(variables).toBeInstanceOf(Array)
    expect(variables).toHaveLength(2)

    const keys = variables.map((v: any) => v.key).sort()
    expect(keys).toEqual(['API_KEY', 'DB_URL'])

    const apiKeyVar = variables.find((v: any) => v.key === 'API_KEY')
    expect(apiKeyVar.values.length).toBeGreaterThanOrEqual(1)
    expect(apiKeyVar.values[0].value).toBe('secret-123')

    const dbUrlVar = variables.find((v: any) => v.key === 'DB_URL')
    expect(dbUrlVar.values[0].value).toBe('postgres://localhost/test')

    ctx.variableId = apiKeyVar.id
  })

  test('update a variable key and value', async () => {
    const firstEnvId = ctx.environmentIds[0]!

    const result = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variables/${ctx.variableId}`, {
      method: 'PUT',
      body: {
        key: 'API_SECRET',
        autoUppercase: false,
        values: [{ environmentId: firstEnvId, value: 'updated-secret-456' }],
      },
    })

    expect(result.statusCode).toBe(200)

    const variables = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variables`)
    const updated = variables.find((v: any) => v.key === 'API_SECRET')
    expect(updated).toBeDefined()
    const updatedVal = updated.values.find((v: any) => v.environmentId === firstEnvId)
    expect(updatedVal.value).toBe('updated-secret-456')
  })

  test('delete a single variable', async () => {
    const result = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variables/${ctx.variableId}`, {
      method: 'DELETE',
    })

    expect(result.statusCode).toBe(200)

    const variables = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variables`)
    expect(variables.find((v: any) => v.id === ctx.variableId)).toBeUndefined()
  })

  test('reads stay correct whichever read fills the cache', async () => {
    const [firstEnvId, secondEnvId, emptyEnvId] = ctx.environmentIds as [number, number, number]
    const project = await ctx.api(`/api/teams/${ctx.teamSlug}/projects`, {
      method: 'POST',
      body: { name: 'Env Reads' },
    })
    const variablesUrl = `/api/teams/${ctx.teamSlug}/projects/${project.id}/variables`
    const readKeys = async (path = '') => {
      const variables = await ctx.api(`${variablesUrl}${path}`)
      return variables.map((v: any) => v.key).sort()
    }
    // A write clears the project's cache, so the next read fills it.
    const write = (key: string, environmentId: number) => ctx.api(variablesUrl, {
      method: 'POST',
      body: { autoUppercase: true, environmentIds: [environmentId], variables: [{ key, value: 'value' }] },
    })

    await write('only_first', firstEnvId)
    await write('only_second', secondEnvId)
    expect(await readKeys(`/env/${firstEnvId}`)).toEqual(['ONLY_FIRST'])
    expect(await readKeys(`/env/${secondEnvId}`)).toEqual(['ONLY_SECOND'])

    await write('only_second', secondEnvId)
    await readKeys()
    expect(await readKeys(`/env/${secondEnvId}`)).toEqual(['ONLY_SECOND'])

    await write('only_second', secondEnvId)
    await readKeys(`/env/${firstEnvId}`)
    expect(await readKeys()).toEqual(['ONLY_FIRST', 'ONLY_SECOND'])

    await write('only_second', secondEnvId)
    expect(await readKeys(`/env/${emptyEnvId}`)).toEqual([])
    expect(await readKeys(`/env/${firstEnvId}`)).toEqual(['ONLY_FIRST'])

    await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${project.id}`, { method: 'DELETE' })
  })
}
