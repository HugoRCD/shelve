import { afterEach, describe, expect, it, vi } from 'vitest'
import { CliError, ShelveApiError } from '../src/services/api-error'
import { ProjectService } from '../src/services/project'
import { initCliContextFromArgv } from '../src/utils/cli-context'
import * as promptModule from '../src/utils/prompt'

// isAgentShell() (cli-context.ts) is `Boolean(detectedAgent || process.env.AI_AGENT)`,
// and both halves are true for the shell these tests run in (an AI coding agent),
// which makes isNonInteractive() true even with default argv. std-env's `agent`
// is mocked out here; AI_AGENT is deleted per-test below (see promptToCreate
// tests) since it's a real env var, not something a module mock reaches. Without
// both, 'default argv' never exercises the interactive branch it's meant to.
vi.mock('std-env', async (importOriginal) => {
  const actual = await importOriginal<typeof import('std-env')>()
  return { ...actual, agent: undefined }
})

/**
 * The API answers 400 when a project name does not exist in the team, which is
 * the branch `getProjectByName` recovers from.
 */
function stubMissingProject(): void {
  const service = ProjectService as unknown as { request: () => Promise<unknown> }
  vi.spyOn(service, 'request').mockRejectedValue(new ShelveApiError('Project not found', 400))
}

const ORIGINAL_AI_AGENT = process.env.AI_AGENT

afterEach(() => {
  if (ORIGINAL_AI_AGENT === undefined) delete process.env.AI_AGENT
  else process.env.AI_AGENT = ORIGINAL_AI_AGENT
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
    delete process.env.AI_AGENT // this shell itself sets AI_AGENT; see std-env mock above for the rest
    initCliContextFromArgv(['node', 'shelve']) // default argv: genuinely interactive
    stubMissingProject()
    const askBoolean = vi.spyOn(promptModule, 'askBoolean').mockResolvedValue(true)
    const create = vi.spyOn(ProjectService, 'createProject').mockResolvedValue({ id: 1, name: 'Ghost' } as never)

    await expect(ProjectService.getProjectByName('ghost', 'team', false)).resolves.toMatchObject({ id: 1 })
    expect(askBoolean).toHaveBeenCalledOnce()
    expect(create).toHaveBeenCalledWith('ghost', 'team', false)
  })

  it('diff (promptToCreate: false) never prompts, even interactively', async () => {
    delete process.env.AI_AGENT // this shell itself sets AI_AGENT; see std-env mock above for the rest
    initCliContextFromArgv(['node', 'shelve']) // default argv: genuinely interactive
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
