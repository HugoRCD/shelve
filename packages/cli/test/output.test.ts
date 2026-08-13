import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ShelveConfig } from '@types'
import { ShelveApiError } from '../src/services/api-error'
import { initCliContextFromArgv } from '../src/utils/cli-context'
import { redactConfig, withSpinner, writeJsonError, writeJsonSuccess } from '../src/utils/output'

afterEach(() => {
  initCliContextFromArgv(['node', 'shelve'])
})

describe('redactConfig', () => {
  it('redacts tokens from config output', () => {
    const config = {
      project: 'demo',
      slug: 'team',
      token: 'secret-token',
      url: 'https://app.shelve.cloud',
      confirmChanges: false,
      envFileName: '.env',
      autoUppercase: true,
      autoCreateProject: true,
      projectFromConfig: true,
      workspaceDir: '/tmp',
      isMonoRepo: false,
      isRoot: true,
    } satisfies ShelveConfig

    expect(redactConfig(config).token).toBe('***')
  })

  it('omits token when absent', () => {
    const config = {
      project: 'demo',
      slug: 'team',
      token: '',
      url: 'https://app.shelve.cloud',
      confirmChanges: false,
      envFileName: '.env',
      autoUppercase: true,
      autoCreateProject: true,
      projectFromConfig: true,
      workspaceDir: '/tmp',
      isMonoRepo: false,
      isRoot: true,
    } satisfies ShelveConfig

    expect(redactConfig(config).token).toBeUndefined()
  })
})

describe('JSON writers', () => {
  it('writes success payloads to stdout', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    writeJsonSuccess({ ok: true }, 'config')
    expect(log).toHaveBeenCalledWith(JSON.stringify({ ok: true, command: 'config', data: { ok: true } }))
    log.mockRestore()
  })

  it('writes error payloads to stderr', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    writeJsonError({ code: 'MISSING_ENV', message: 'Environment required', hint: 'Pass --env.' })
    expect(error).toHaveBeenCalledWith(JSON.stringify({
      ok: false,
      error: {
        code: 'MISSING_ENV',
        message: 'Environment required',
        hint: 'Pass --env.',
      },
    }))
    error.mockRestore()
  })

  // Change 2: the completed-package list from a monorepo fan-out failure used to
  // exist only inside the hint's prose. `context` gives a --json consumer the
  // same information structured.
  it('includes a structured context field when present', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    writeJsonError({
      code: 'FORBIDDEN',
      message: 'apps/web: Forbidden',
      status: 403,
      hint: 'Already completed: apps/api.',
      context: { failedPackage: 'apps/web', completedPackages: ['apps/api'] },
    })
    expect(error).toHaveBeenCalledWith(JSON.stringify({
      ok: false,
      error: {
        code: 'FORBIDDEN',
        message: 'apps/web: Forbidden',
        status: 403,
        hint: 'Already completed: apps/api.',
        context: { failedPackage: 'apps/web', completedPackages: ['apps/api'] },
      },
    }))
    error.mockRestore()
  })

  it('omits context when absent', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    writeJsonError({ code: 'MISSING_ENV', message: 'Environment required' })
    const [payload] = error.mock.calls[0] as [string]
    expect(JSON.parse(payload).error.context).toBeUndefined()
    error.mockRestore()
  })
})

// Change 4: handleThrownError (called from withSpinner's catch) used to wrap
// every error in a bare `Error` before handing it to toCliError, which discarded
// a ShelveApiError's status and the specific code (FORBIDDEN/NOT_FOUND/
// AUTH_REQUIRED) toCliError derives from it, landing on OPERATION_FAILED with no
// status instead.
describe('withSpinner error handling', () => {
  afterEach(() => {
    initCliContextFromArgv(['node', 'shelve'])
  })

  it('a ShelveApiError surfaces its real status and code instead of OPERATION_FAILED', async () => {
    initCliContextFromArgv(['node', 'shelve', '--json'])

    await expect(
      withSpinner('Fetch project', () => Promise.reject(new ShelveApiError('Forbidden', 403))),
    ).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403, message: 'Forbidden' })
  })

  it('a plain Error still falls back to OPERATION_FAILED', async () => {
    initCliContextFromArgv(['node', 'shelve', '--json'])

    await expect(
      withSpinner('Fetch project', () => Promise.reject(new Error('boom'))),
    ).rejects.toMatchObject({ code: 'OPERATION_FAILED', status: undefined, message: 'boom' })
  })

  it('a non-Error rejection falls back to OPERATION_FAILED with the contextual wording', async () => {
    initCliContextFromArgv(['node', 'shelve', '--json'])

    await expect(
      withSpinner('Fetch project', () => Promise.reject('nope')),
    ).rejects.toMatchObject({ code: 'OPERATION_FAILED', message: 'Fetch project failed' })
  })
})
