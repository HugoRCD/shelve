import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ShelveConfig } from '@types'
import { initCliContextFromArgv } from '../src/utils/cli-context'
import { redactConfig, writeJsonError, writeJsonSuccess } from '../src/utils/output'

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
