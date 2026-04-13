import { test, expect } from 'vitest'
import type { E2EContext } from '../helpers'

export function registerCleanupTests(ctx: E2EContext) {
  test('delete the project', async () => {
    const result = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}`, {
      method: 'DELETE',
    })

    expect(result.statusCode).toBe(200)
  })

  test('delete the team', async () => {
    const result = await ctx.api(`/api/teams/${ctx.teamSlug}`, {
      method: 'DELETE',
    })

    expect(result.statusCode).toBe(200)
  })
}
