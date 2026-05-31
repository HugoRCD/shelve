import { describe, test, expect, vi, beforeEach } from 'vitest'
import type { Project } from '@types'

vi.stubGlobal('createError', (opts: { statusCode: number; message?: string }) => {
  const err = new Error(opts.message ?? '') as Error & { statusCode: number }
  err.statusCode = opts.statusCode
  return err
})
vi.stubGlobal('withCache', (_entity: string, fn: (...args: unknown[]) => unknown) => fn)

const projectOnA = { id: 10, teamId: 1, name: 'app' } as Project
const projectOnB = { id: 20, teamId: 2, name: 'other' } as Project

describe('ProjectsService.getProjectForTeam', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  test('returns the project when it belongs to the team', async () => {
    const { ProjectsService } = await import('../../server/services/projects')
    const service = new ProjectsService()
    const getProject = vi.spyOn(service, 'getProject').mockResolvedValue(projectOnA)

    await expect(service.getProjectForTeam(projectOnA.id, 1)).resolves.toEqual(projectOnA)
    expect(getProject).toHaveBeenCalledWith(projectOnA.id)
  })

  test('returns 404 when the project belongs to another team', async () => {
    const { ProjectsService } = await import('../../server/services/projects')
    const service = new ProjectsService()
    const getProject = vi.spyOn(service, 'getProject').mockResolvedValue(projectOnB)

    await expect(service.getProjectForTeam(projectOnB.id, 1)).rejects.toMatchObject({
      statusCode: 404,
    })
    expect(getProject).toHaveBeenCalledWith(projectOnB.id)
  })
})
