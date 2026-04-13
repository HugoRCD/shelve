import { describe, test, expect } from 'vitest'
import { formatEnvString } from '../../app/utils/env'
import type { Variable } from '@types'

function makeVariable(overrides: Partial<Variable> & { key: string }): Variable {
  return {
    id: 1,
    projectId: 1,
    values: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

const ENV_ID = 10

describe('formatEnvString', () => {
  test('formats ungrouped variables', () => {
    const vars = [
      makeVariable({ key: 'FOO', values: [{ value: 'bar', environmentId: ENV_ID }] }),
      makeVariable({ key: 'BAZ', values: [{ value: 'qux', environmentId: ENV_ID }] }),
    ]

    const result = formatEnvString(vars, ENV_ID)

    expect(result).toBe('FOO=bar\nBAZ=qux')
  })

  test('formats variables with descriptions', () => {
    const vars = [
      makeVariable({ key: 'API_KEY', description: 'Main API key', values: [{ value: 'secret', environmentId: ENV_ID }] }),
      makeVariable({ key: 'OTHER', values: [{ value: 'val', environmentId: ENV_ID }] }),
    ]

    const result = formatEnvString(vars, ENV_ID)

    expect(result).toBe('# Main API key\nAPI_KEY=secret\nOTHER=val')
  })

  test('formats grouped variables with headers', () => {
    const group = { id: 1, name: 'Database', description: 'DB settings', position: 0, projectId: 1, createdAt: new Date(), updatedAt: new Date() }
    const vars = [
      makeVariable({ key: 'DB_HOST', groupId: 1, group, values: [{ value: 'localhost', environmentId: ENV_ID }] }),
      makeVariable({ key: 'DB_PORT', groupId: 1, group, values: [{ value: '5432', environmentId: ENV_ID }] }),
    ]

    const result = formatEnvString(vars, ENV_ID)

    expect(result).toBe([
      '# ---- Database ----',
      '# DB settings',
      'DB_HOST=localhost',
      'DB_PORT=5432',
    ].join('\n'))
  })

  test('separates groups with blank lines', () => {
    const groupA = { id: 1, name: 'GitHub', description: '', position: 0, projectId: 1, createdAt: new Date(), updatedAt: new Date() }
    const groupB = { id: 2, name: 'Database', description: 'DB config', position: 1, projectId: 1, createdAt: new Date(), updatedAt: new Date() }
    const vars = [
      makeVariable({ key: 'GH_TOKEN', groupId: 1, group: groupA, values: [{ value: 'ghp_xxx', environmentId: ENV_ID }] }),
      makeVariable({ key: 'DB_URL', groupId: 2, group: groupB, values: [{ value: 'pg://...', environmentId: ENV_ID }] }),
    ]

    const result = formatEnvString(vars, ENV_ID)

    expect(result).toBe([
      '# ---- GitHub ----',
      'GH_TOKEN=ghp_xxx',
      '',
      '# ---- Database ----',
      '# DB config',
      'DB_URL=pg://...',
    ].join('\n'))
  })

  test('places ungrouped after grouped with blank line', () => {
    const group = { id: 1, name: 'App', description: '', position: 0, projectId: 1, createdAt: new Date(), updatedAt: new Date() }
    const vars = [
      makeVariable({ key: 'APP_KEY', groupId: 1, group, values: [{ value: 'key', environmentId: ENV_ID }] }),
      makeVariable({ key: 'NODE_ENV', values: [{ value: 'production', environmentId: ENV_ID }] }),
    ]

    const result = formatEnvString(vars, ENV_ID)

    expect(result).toBe([
      '# ---- App ----',
      'APP_KEY=key',
      '',
      'NODE_ENV=production',
    ].join('\n'))
  })

  test('uses empty string for missing environment value', () => {
    const vars = [
      makeVariable({ key: 'MISSING', values: [{ value: 'val', environmentId: 999 }] }),
    ]

    const result = formatEnvString(vars, ENV_ID)

    expect(result).toBe('MISSING=')
  })

  test('omits group description line when empty', () => {
    const group = { id: 1, name: 'NoDesc', description: '', position: 0, projectId: 1, createdAt: new Date(), updatedAt: new Date() }
    const vars = [
      makeVariable({ key: 'KEY', groupId: 1, group, values: [{ value: 'val', environmentId: ENV_ID }] }),
    ]

    const result = formatEnvString(vars, ENV_ID)
    const lines = result.split('\n')

    expect(lines[0]).toBe('# ---- NoDesc ----')
    expect(lines[1]).toBe('KEY=val')
    expect(lines).toHaveLength(2)
  })

  test('includes variable description inside group', () => {
    const group = { id: 1, name: 'DB', description: 'Config', position: 0, projectId: 1, createdAt: new Date(), updatedAt: new Date() }
    const vars = [
      makeVariable({ key: 'DB_HOST', description: 'The hostname', groupId: 1, group, values: [{ value: 'localhost', environmentId: ENV_ID }] }),
    ]

    const result = formatEnvString(vars, ENV_ID)

    expect(result).toBe([
      '# ---- DB ----',
      '# Config',
      '# The hostname',
      'DB_HOST=localhost',
    ].join('\n'))
  })
})
