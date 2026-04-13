import { test, expect } from 'vitest'
import type { E2EContext } from '../helpers'

export function registerVariableGroupTests(ctx: E2EContext) {
  // ─── Variable Groups CRUD ───

  test('create a variable group', async () => {
    const result = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variable-groups`, {
      method: 'POST',
      body: { name: 'Database', description: 'Database connection settings', position: 0 },
    })

    expect(result.statusCode).toBe(201)
    expect(result.group.name).toBe('Database')
    expect(result.group.description).toBe('Database connection settings')
    expect(result.group.position).toBe(0)
    expect(result.group.projectId).toBe(ctx.projectId)

    ctx.groupId = result.group.id
  })

  test('list variable groups', async () => {
    const groups = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variable-groups`)

    expect(groups).toBeInstanceOf(Array)
    expect(groups).toHaveLength(1)
    expect(groups[0].name).toBe('Database')
  })

  test('update a variable group', async () => {
    const result = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variable-groups/${ctx.groupId}`, {
      method: 'PUT',
      body: { name: 'DB Config', description: 'Updated description' },
    })

    expect(result.statusCode).toBe(200)
    expect(result.group.name).toBe('DB Config')
    expect(result.group.description).toBe('Updated description')
  })

  // ─── Variable Description & Group Assignment ───

  test('create variables with descriptions', async () => {
    const result = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variables`, {
      method: 'POST',
      body: {
        autoUppercase: true,
        environmentIds: ctx.environmentIds,
        variables: [
          { key: 'db_host', value: 'localhost', description: 'Database hostname' },
          { key: 'db_port', value: '5432', description: 'Database port' },
        ],
      },
    })

    expect(result.statusCode).toBe(201)
  })

  test('variables have descriptions', async () => {
    const variables = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variables`)

    const dbHost = variables.find((v: any) => v.key === 'DB_HOST')
    expect(dbHost).toBeDefined()
    expect(dbHost.description).toBe('Database hostname')

    const dbPort = variables.find((v: any) => v.key === 'DB_PORT')
    expect(dbPort).toBeDefined()
    expect(dbPort.description).toBe('Database port')
  })

  test('assign a variable to a group via update', async () => {
    const variables = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variables`)
    const dbHost = variables.find((v: any) => v.key === 'DB_HOST')

    const result = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variables/${dbHost.id}`, {
      method: 'PUT',
      body: {
        key: 'DB_HOST',
        autoUppercase: false,
        groupId: ctx.groupId,
        values: dbHost.values.map((v: any) => ({ environmentId: v.environmentId, value: v.value })),
      },
    })

    expect(result.statusCode).toBe(200)

    const updated = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variables`)
    const updatedHost = updated.find((v: any) => v.key === 'DB_HOST')
    expect(updatedHost.groupId).toBe(ctx.groupId)
    expect(updatedHost.group.name).toBe('DB Config')
  })

  test('bulk assign variables to a group', async () => {
    const variables = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variables`)
    const ids = variables
      .filter((v: any) => v.key === 'DB_HOST' || v.key === 'DB_PORT')
      .map((v: any) => v.id)

    const result = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variables/group`, {
      method: 'PATCH',
      body: { variableIds: ids, groupId: ctx.groupId },
    })

    expect(result.statusCode).toBe(200)

    const updated = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variables`)
    for (const v of updated.filter((v: any) => ids.includes(v.id))) {
      expect(v.groupId).toBe(ctx.groupId)
    }
  })

  test('bulk unassign variables from a group', async () => {
    const variables = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variables`)
    const ids = variables
      .filter((v: any) => v.key === 'DB_PORT')
      .map((v: any) => v.id)

    const result = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variables/group`, {
      method: 'PATCH',
      body: { variableIds: ids, groupId: null },
    })

    expect(result.statusCode).toBe(200)

    const updated = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variables`)
    const dbPort = updated.find((v: any) => v.key === 'DB_PORT')
    expect(dbPort.groupId).toBeNull()
  })

  // ─── Env Export with Groups & Descriptions ───

  test('env export includes group and description metadata', async () => {
    const envId = ctx.environmentIds[0]!
    const exported = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variables/env/${envId}`)

    expect(exported).toBeInstanceOf(Array)

    const dbHost = exported.find((v: any) => v.key === 'DB_HOST')
    if (dbHost) {
      expect(dbHost.description).toBe('Database hostname')
      expect(dbHost.group).toBeDefined()
      expect(dbHost.group.name).toBe('DB Config')
      expect(dbHost.group.description).toBe('Updated description')
    }

    const dbPort = exported.find((v: any) => v.key === 'DB_PORT')
    if (dbPort) {
      expect(dbPort.description).toBe('Database port')
      expect(dbPort.group).toBeUndefined()
    }
  })

  // ─── Delete group (cascade unassigns) ───

  test('delete a variable group', async () => {
    const result = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variable-groups/${ctx.groupId}`, {
      method: 'DELETE',
    })

    expect(result.statusCode).toBe(200)

    const groups = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variable-groups`)
    expect(groups).toHaveLength(0)

    const variables = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}/variables`)
    const dbHost = variables.find((v: any) => v.key === 'DB_HOST')
    expect(dbHost.groupId).toBeNull()
  })
}
