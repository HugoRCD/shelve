import { describe, expect, it } from 'vitest'
import { CLI_ERROR_CODES, formatErrorCodesHelp } from '../src/utils/error-codes'

describe('error-codes', () => {
  it('documents device login error codes', () => {
    expect(CLI_ERROR_CODES.DEVICE_LOGIN_DENIED?.hint).toContain('shelve login')
    expect(CLI_ERROR_CODES.DEVICE_LOGIN_EXPIRED?.hint).toBeDefined()
    expect(CLI_ERROR_CODES.DEVICE_LOGIN_TIMEOUT?.hint).toBeDefined()
  })

  it('documents AGENT_BLOCKED and AUTH_REQUIRED', () => {
    expect(CLI_ERROR_CODES.AGENT_BLOCKED?.meaning).toContain('pull')
    expect(CLI_ERROR_CODES.AUTH_REQUIRED?.hint).toContain('SHELVE_TOKEN')
  })

  it('formatErrorCodesHelp includes exit codes', () => {
    const help = formatErrorCodesHelp()
    expect(help).toContain('AGENT_BLOCKED')
    expect(help).toContain('0 ok')
  })
})
