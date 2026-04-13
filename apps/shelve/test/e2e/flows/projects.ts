import { test, expect } from 'vitest'
import type { E2EContext } from '../helpers'

export function registerProjectTests(ctx: E2EContext) {
  test('create a project', async () => {
    const project = await ctx.api(`/api/teams/${ctx.teamSlug}/projects`, {
      method: 'POST',
      body: { name: 'My App' },
    })

    expect(project.name).toBe('My App')
    expect(project.teamId).toBeDefined()

    ctx.projectId = project.id
  })

  test('list projects includes the new project', async () => {
    const projects = await ctx.api(`/api/teams/${ctx.teamSlug}/projects`)

    expect(projects).toBeInstanceOf(Array)
    expect(projects.some((p: any) => p.id === ctx.projectId)).toBe(true)
  })

  test('get project by id', async () => {
    const project = await ctx.api(`/api/teams/${ctx.teamSlug}/projects/${ctx.projectId}`)

    expect(project.id).toBe(ctx.projectId)
    expect(project.name).toBe('My App')
  })
}
