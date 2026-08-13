import { afterEach, describe, expect, it, vi } from 'vitest'
import { CliError, ShelveApiError } from '../src/services/api-error'
import { ProjectService } from '../src/services/project'
import { initCliContextFromArgv } from '../src/utils/cli-context'
import * as promptModule from '../src/utils/prompt'

// isNonInteractive() (cli-context.ts) is true whenever the shell looks
// automated, by three separate signals: std-env's `agent`, AI_AGENT, and CI.
// `agent` is a module export so it's mocked; the other two are real env vars a
// module mock can't reach, so goInteractive() deletes them. All three have to go
// or 'default argv' never reaches the interactive branch these tests are about —
// AI_AGENT is set by the agent shell this is developed in, CI by GitHub Actions,
// so leaving either out passes in one place and fails in the other.
vi.mock('std-env', async (importOriginal) => {
  const actual = await importOriginal<typeof import('std-env')>()
  return { ...actual, agent: undefined }
})

const AUTOMATION_ENV_KEYS = ['AI_AGENT', 'CI'] as const
const ORIGINAL_ENV = Object.fromEntries(AUTOMATION_ENV_KEYS.map(key => [key, process.env[key]]))

/** Puts the process in the genuinely-interactive state a developer's terminal is in. */
function goInteractive(): void {
  for (const key of AUTOMATION_ENV_KEYS) delete process.env[key]
  // after the deletes: initCliContextFromArgv reads CI once, at init
  initCliContextFromArgv(['node', 'shelve'])
}

/**
 * The API answers 400 when a project name does not exist in the team, which is
 * the branch `getProjectByName` recovers from.
 */
function stubMissingProject(): void {
  const service = ProjectService as unknown as { request: () => Promise<unknown> }
  vi.spyOn(service, 'request').mockRejectedValue(new ShelveApiError('Project not found', 400))
}

afterEach(() => {
  for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
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

// Change 3: getProjectByName's interactive fallback used to offer to create a
// missing project whenever autoCreate was false, regardless of caller — which
// broke `diff`'s "no writes" guarantee for an interactive user. promptToCreate
// is the opt-out; pull/push/sync/doctor/run never pass it, so they keep this
// prompt-then-create behaviour.
describe('getProjectByName promptToCreate', () => {
  it('pull/push/sync (default promptToCreate) still prompt to create interactively', async () => {
    goInteractive()
    stubMissingProject()
    const askBoolean = vi.spyOn(promptModule, 'askBoolean').mockResolvedValue(true)
    const create = vi.spyOn(ProjectService, 'createProject').mockResolvedValue({ id: 1, name: 'Ghost' } as never)

    await expect(ProjectService.getProjectByName('ghost', 'team', false)).resolves.toMatchObject({ id: 1 })
    expect(askBoolean).toHaveBeenCalledOnce()
    expect(create).toHaveBeenCalledWith('ghost', 'team', false)
  })

  it('diff (promptToCreate: false) never prompts, even interactively', async () => {
    goInteractive()
    stubMissingProject()
    const askBoolean = vi.spyOn(promptModule, 'askBoolean')
    const create = vi.spyOn(ProjectService, 'createProject')

    await expect(ProjectService.getProjectByName('ghost', 'team', false, false)).rejects.toMatchObject({
      code: 'PROJECT_NOT_FOUND',
    })
    expect(askBoolean).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
  })
})
