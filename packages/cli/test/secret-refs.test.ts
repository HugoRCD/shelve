import { describe, expect, it } from 'vitest'
import { parseEnvTemplate, resolveReferences } from '../src/utils/secret-refs'

describe('parseEnvTemplate', () => {
  it('returns empty for blank input', () => {
    const out = parseEnvTemplate('')
    expect(out).toEqual({ references: [], literals: [] })
  })

  it('ignores blank lines and comments', () => {
    const out = parseEnvTemplate('\n# a comment\n  # also a comment\n\n')
    expect(out).toEqual({ references: [], literals: [] })
  })

  it('parses literal values', () => {
    const out = parseEnvTemplate('NODE_ENV=production\nPORT=3000')
    expect(out.references).toHaveLength(0)
    expect(out.literals).toEqual([
      { key: 'NODE_ENV', value: 'production' },
      { key: 'PORT', value: '3000' },
    ])
  })

  it('strips surrounding quotes from literals', () => {
    const out = parseEnvTemplate('A="double"\nB=\'single\'')
    expect(out.literals).toEqual([
      { key: 'A', value: 'double' },
      { key: 'B', value: 'single' },
    ])
  })

  it('parses short-form reference (same env, same key)', () => {
    const out = parseEnvTemplate('DATABASE_URL=shelve://DATABASE_URL')
    expect(out.literals).toHaveLength(0)
    expect(out.references).toEqual([{ key: 'DATABASE_URL', environment: null, remoteKey: 'DATABASE_URL' },])
  })

  it('parses scoped reference (cross-env)', () => {
    const out = parseEnvTemplate('DB=shelve://production/DATABASE_URL')
    expect(out.references).toEqual([{ key: 'DB', environment: 'production', remoteKey: 'DATABASE_URL' },])
  })

  it('allows renaming the template key', () => {
    const out = parseEnvTemplate('LOCAL_DB=shelve://REMOTE_DB')
    expect(out.references).toEqual([{ key: 'LOCAL_DB', environment: null, remoteKey: 'REMOTE_DB' },])
  })

  it('skips malformed lines (no equals sign)', () => {
    const out = parseEnvTemplate('justakey\nOK=1')
    expect(out.literals).toEqual([{ key: 'OK', value: '1' }])
  })

  it('falls back to literal when value does not match shelve:// shape', () => {
    const out = parseEnvTemplate('URL=shelve://with spaces')
    expect(out.references).toHaveLength(0)
    expect(out.literals).toEqual([{ key: 'URL', value: 'shelve://with spaces' }])
  })
})

describe('resolveReferences', () => {
  const variables = [
    { key: 'DATABASE_URL', value: 'postgres://prod' },
    { key: 'API_KEY', value: 'sk-123' },
  ]

  it('emits literals verbatim', () => {
    const parsed = parseEnvTemplate('NODE_ENV=production')
    const { resolved, missing } = resolveReferences(parsed, variables, 'production')
    expect(resolved).toEqual([{ key: 'NODE_ENV', value: 'production' }])
    expect(missing).toHaveLength(0)
  })

  it('resolves references against the current env', () => {
    const parsed = parseEnvTemplate('DB=shelve://DATABASE_URL')
    const { resolved, missing } = resolveReferences(parsed, variables, 'production')
    expect(resolved).toEqual([{ key: 'DB', value: 'postgres://prod' }])
    expect(missing).toHaveLength(0)
  })

  it('reports references whose remoteKey is absent', () => {
    const parsed = parseEnvTemplate('TOKEN=shelve://MISSING')
    const { resolved, missing } = resolveReferences(parsed, variables, 'production')
    expect(resolved).toHaveLength(0)
    expect(missing).toHaveLength(1)
    expect(missing[0]?.remoteKey).toBe('MISSING')
  })

  it('flags references targeting a different environment as missing', () => {
    const parsed = parseEnvTemplate('DB=shelve://staging/DATABASE_URL')
    const { resolved, missing } = resolveReferences(parsed, variables, 'production')
    expect(resolved).toHaveLength(0)
    expect(missing).toEqual([{ key: 'DB', environment: 'staging', remoteKey: 'DATABASE_URL' },])
  })

  it('mixes literals and references preserving template order for each group', () => {
    const parsed = parseEnvTemplate([
      'NODE_ENV=production',
      'DB=shelve://DATABASE_URL',
      'API=shelve://API_KEY',
    ].join('\n'))
    const { resolved } = resolveReferences(parsed, variables, 'production')
    expect(resolved.map((v) => v.key)).toEqual(['NODE_ENV', 'DB', 'API'])
  })
})
