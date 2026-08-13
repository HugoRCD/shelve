import { afterEach, describe, expect, it, vi } from 'vitest'
import { CliError, ShelveApiError } from '../src/services/api-error'
import { ProjectService } from '../src/services/project'
import { initCliContextFromArgv } from '../src/utils/cli-context'

/**
 * The API answers 400 when a project name does not exist in the team, which is
 * the branch `getProjectByName` recovers from.
 */
function stubMissingProject(): void {
  const service = ProjectService as unknown as { request: () => Promise<unknown> }
  vi.spyOn(service, 'request').mockRejectedValue(new ShelveApiError('Project not found', 400))
}

afterEach(() => {
  initCliContextFromArgv(['node', 'shelve'])
  vi.restoreAllMocks()
})

describe('autoCreateProject: false', () => {
  it('is not overridden by --yes', async () => {
    initCliContextFromArgv(['node', 'shelve', 'pull', '--yes'])
    stubMissingProject()
    const create = vi.spyOn(ProjectService, 'createProject')

    await expect(ProjectService.getProjectByName('ghost', 'team', false)).rejects.toMatchObject({
      code: 'PROJECT_NOT_FOUND',
    })
    expect(create).not.toHaveBeenCalled()
  })

  it('is not overridden by --non-interactive', async () => {
    initCliContextFromArgv(['node', 'shelve', 'pull', '--non-interactive'])
    stubMissingProject()
    const create = vi.spyOn(ProjectService, 'createProject')

    await expect(ProjectService.getProjectByName('ghost', 'team', false)).rejects.toBeInstanceOf(CliError)
    expect(create).not.toHaveBeenCalled()
  })

  it('still auto-creates when left enabled', async () => {
    initCliContextFromArgv(['node', 'shelve', 'pull', '--yes'])
    stubMissingProject()
    const create = vi.spyOn(ProjectService, 'createProject').mockResolvedValue({ id: 1, name: 'Ghost' } as never)

    await expect(ProjectService.getProjectByName('ghost', 'team', true)).resolves.toMatchObject({ id: 1 })
    expect(create).toHaveBeenCalledWith('ghost', 'team', true)
  })
})
