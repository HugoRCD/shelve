import { fetch, url } from '@nuxt/test-utils/e2e'
import { test, expect } from 'vitest'
import type { AuditLogResponse } from '@types'
import type { E2EContext } from '../helpers'

async function waitForAuditAction(
  ctx: E2EContext,
  action: string,
  timeoutMs = 5000,
): Promise<AuditLogResponse> {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    const feed = await ctx.api<AuditLogResponse>(`/api/teams/${ctx.teamSlug}/audit-logs`)
    if (feed.logs.some(entry => entry.action === action)) return feed
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  throw new Error(`Timed out waiting for audit action "${action}"`)
}

export function registerAuditLogTests(ctx: E2EContext) {
  test('records a `token.create` event when a token is created', async () => {
    await ctx.api('/api/tokens', {
      method: 'POST',
      body: { name: 'audited-token' },
    })

    const feed = await waitForAuditAction(ctx, 'token.create')
    expect(Array.isArray(feed.logs)).toBe(true)
    expect(feed.logs.some(entry => entry.action === 'token.create')).toBe(true)
    expect(feed.logs[0]?.summary).toBeTruthy()
    expect(feed.logs[0]?.actor?.label).toBeTruthy()
  })

  test('records reads from the app, bulk deletes and sync policy changes', async () => {
    const teamUrl = `/api/teams/${ctx.teamSlug}`
    const projectUrl = `${teamUrl}/projects/${ctx.projectId}`
    const entries = async (action: string) =>
      (await ctx.api<AuditLogResponse>(`${teamUrl}/audit-logs?action=${action}&limit=100`)).logs

    await ctx.api(`${projectUrl}/variables`)
    const read = (await entries('variables.read')).find(entry => entry.resourceType === 'project')
    expect(read?.resourceId).toBe(String(ctx.projectId))

    await ctx.api(`${projectUrl}/variables`, {
      method: 'POST',
      body: { autoUppercase: true, environmentIds: [ctx.environmentIds[0]], variables: [{ key: 'bulk_a', value: 'a' }, { key: 'bulk_b', value: 'b' }] },
    })
    const variables = await ctx.api<{ id: number, key: string }[]>(`${projectUrl}/variables`)
    const bulk = variables.filter(variable => variable.key.startsWith('BULK_'))
    await ctx.api(`${projectUrl}/variables`, { method: 'DELETE', body: { variables: bulk.map(variable => variable.id) } })
    const deleted = (await entries('variables.delete')).find(entry => Array.isArray(entry.metadata?.keys))
    expect((deleted?.metadata?.keys as string[]).sort()).toEqual(['BULK_A', 'BULK_B'])

    const project = await ctx.api<{ name: string }>(projectUrl)
    await ctx.api(projectUrl, { method: 'PUT', body: { name: project.name, syncPolicy: { protectedEnvironments: ['production'] } } })
    await ctx.api(projectUrl, { method: 'PUT', body: { name: project.name, syncPolicy: null } })
    const [unprotected] = await entries('project.update')
    expect(unprotected?.metadata).toMatchObject({
      fields: ['syncPolicy'],
      syncPolicy: null,
      previousSyncPolicy: { protectedEnvironments: ['production'] },
    })
  })

  test('attributes token requests to the token and sets no session cookie', async () => {
    const { token } = await ctx.api<{ token: string }>('/api/tokens', {
      method: 'POST',
      body: { name: 'audit-actor' },
    })

    const response = await fetch(url(`/api/teams/${ctx.teamSlug}/environments`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: 'token-made' }),
    })
    expect(response.status).toBe(200)
    expect(response.headers.getSetCookie().filter(c => c.startsWith('nuxt-auth-session='))).toEqual([])

    const feed = await waitForAuditAction(ctx, 'environment.create')
    const entry = feed.logs.find(log => log.action === 'environment.create' && log.metadata?.name === 'token-made')
    expect(entry?.actor.type).toBe('token')
    expect(entry?.metadata).toMatchObject({ tokenName: 'audit-actor' })

    await ctx.api(`/api/teams/${ctx.teamSlug}/environments/${entry!.resourceId}`, { method: 'DELETE' })
  })

  test('filters by action', async () => {
    const feed = await ctx.api<AuditLogResponse>(
      `/api/teams/${ctx.teamSlug}/audit-logs?action=variables.create`
    )
    for (const entry of feed.logs) expect(entry.action).toBe('variables.create')
  })

  test('respects the limit query param', async () => {
    const feed = await ctx.api<AuditLogResponse>(`/api/teams/${ctx.teamSlug}/audit-logs?limit=1`)
    expect(feed.logs.length).toBeLessThanOrEqual(1)
    expect(typeof feed.total).toBe('number')
  })

  test('rejects invalid limit values', async () => {
    await expect(
      ctx.api<AuditLogResponse>(`/api/teams/${ctx.teamSlug}/audit-logs?limit=0`)
    ).rejects.toMatchObject({ statusCode: 400 })
  })
}
