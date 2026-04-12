import { describe, test, expect } from 'vitest'
import { parseEnvFile } from '@utils/envfile'

describe('parseEnvFile', () => {
  test('parses simple key=value pairs', () => {
    const result = parseEnvFile('FOO=bar\nBAZ=qux')
    expect(result).toEqual([
      { key: 'FOO', value: 'bar' },
      { key: 'BAZ', value: 'qux' },
    ])
  })

  test('handles empty values', () => {
    const result = parseEnvFile('EMPTY=')
    expect(result).toEqual([{ key: 'EMPTY', value: '' },])
  })

  test('handles quoted values', () => {
    const result = parseEnvFile('QUOTED="hello world"')
    expect(result).toEqual([{ key: 'QUOTED', value: 'hello world' },])
  })

  test('includes index when withIndex is true', () => {
    const result = parseEnvFile('A=1\nB=2\nC=3', true)
    expect(result).toEqual([
      { index: 0, key: 'A', value: '1' },
      { index: 1, key: 'B', value: '2' },
      { index: 2, key: 'C', value: '3' },
    ])
  })

  test('does not include index when withIndex is false', () => {
    const result = parseEnvFile('A=1\nB=2')
    expect(result[0]).not.toHaveProperty('index')
    expect(result[1]).not.toHaveProperty('index')
  })

  test('returns empty array for empty content', () => {
    expect(parseEnvFile('')).toEqual([])
  })

  test('skips comments', () => {
    const result = parseEnvFile('# comment\nKEY=value')
    expect(result).toEqual([{ key: 'KEY', value: 'value' },])
  })

  test('handles values with equals signs', () => {
    const result = parseEnvFile('URL=https://example.com?foo=bar')
    expect(result).toEqual([{ key: 'URL', value: 'https://example.com?foo=bar' },])
  })

  test('handles multiline content', () => {
    const content = `
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shelve
`
    const result = parseEnvFile(content)
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ key: 'DB_HOST', value: 'localhost' })
    expect(result[1]).toEqual({ key: 'DB_PORT', value: '5432' })
    expect(result[2]).toEqual({ key: 'DB_NAME', value: 'shelve' })
  })
})
