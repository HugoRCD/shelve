import { afterEach, describe, expect, it } from 'vitest'
import {
  getCommandFromArgv,
  initCliContextFromArgv,
  isJson,
  isNonInteractive,
  isQuiet,
  shouldSkipConfirm,
  stripGlobalFlags,
} from '../src/utils/cli-context'

const ORIGINAL_AI_AGENT = process.env.AI_AGENT
const ORIGINAL_CI = process.env.CI

afterEach(() => {
  process.env.AI_AGENT = ORIGINAL_AI_AGENT
  process.env.CI = ORIGINAL_CI
  initCliContextFromArgv(['node', 'shelve'])
})

describe('initCliContextFromArgv', () => {
  it('parses global flags anywhere in argv', () => {
    initCliContextFromArgv(['node', 'shelve', 'run', '--json', '--quiet', '--yes', '--non-interactive', '--', 'pnpm', 'dev'])
    expect(isJson()).toBe(true)
    expect(isQuiet()).toBe(true)
    expect(shouldSkipConfirm()).toBe(true)
    expect(isNonInteractive()).toBe(true)
  })

  it('treats CI as non-interactive', () => {
    process.env.CI = 'true'
    initCliContextFromArgv(['node', 'shelve', 'config'])
    expect(isNonInteractive()).toBe(true)
  })

  it('treats AI_AGENT as non-interactive', () => {
    process.env.AI_AGENT = 'cursor'
    initCliContextFromArgv(['node', 'shelve', 'config'])
    expect(isNonInteractive()).toBe(true)
  })
})

describe('getCommandFromArgv', () => {
  it('returns the first non-flag subcommand', () => {
    expect(getCommandFromArgv(['node', 'shelve', '--json', 'config'])).toBe('config')
    expect(getCommandFromArgv(['node', 'shelve', 'run', '--', 'pnpm', 'dev'])).toBe('run')
  })
})

describe('stripGlobalFlags', () => {
  it('removes known global flags', () => {
    expect(stripGlobalFlags(['shelve', '--json', 'config', '--quiet'])).toEqual(['shelve', 'config'])
  })
})
