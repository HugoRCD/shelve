import { test, expect } from 'vitest'
import type { E2EContext } from '../helpers'
import type { AuditLogResponse } from '@types'

export function registerAuditLogTests(ctx: E2EContext) {
  test('records a `token.create` event when a token is created', async () => {
    await ctx.api('/api/tokens', {
      method: 'POST',
      body: { name: 'audited-token' },
    })

    const feed = await ctx.api<AuditLogResponse>(`/api/teams/${ctx.teamSlug}/audit-logs`)
    expect(Array.isArray(feed.logs)).toBe(true)
    expect(feed.logs.some(entry => entry.action === 'token.create')).toBe(true)
    expect(feed.logs[0]?.summary).toBeTruthy()
    expect(feed.logs[0]?.actor?.label).toBeTruthy()
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
