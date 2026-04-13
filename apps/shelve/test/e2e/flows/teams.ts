import { test, expect } from 'vitest'
import type { E2EContext } from '../helpers'

export function registerTeamTests(ctx: E2EContext) {
  test('create a team', async () => {
    const team = await ctx.api('/api/teams', {
      method: 'POST',
      body: { name: 'E2E Team' },
    })

    expect(team.name).toBe('E2E Team')
    expect(team.slug).toBe('e2e-team')
    expect(team.members).toHaveLength(1)
    expect(team.members[0].role).toBe('owner')

    ctx.teamSlug = team.slug
  })

  test('list teams includes the new team', async () => {
    const teams = await ctx.api('/api/teams')

    expect(teams).toBeInstanceOf(Array)
    expect(teams.some((t: any) => t.slug === ctx.teamSlug)).toBe(true)
  })

  test('get team by slug', async () => {
    const team = await ctx.api(`/api/teams/${ctx.teamSlug}`)

    expect(team.slug).toBe(ctx.teamSlug)
    expect(team.members).toHaveLength(1)
  })

  test('team has default environments', async () => {
    const envs = await ctx.api(`/api/teams/${ctx.teamSlug}/environments`)

    expect(envs.length).toBeGreaterThanOrEqual(3)
    const names = envs.map((e: any) => e.name)
    expect(names).toContain('development')
    expect(names).toContain('preview')
    expect(names).toContain('production')

    ctx.environmentIds = envs.map((e: any) => e.id)
  })
}
