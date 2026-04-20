import { describe, expect, it } from 'vitest'
import { parseDuration } from '../src/utils/duration'

describe('parseDuration', () => {
  const DEFAULT = 12345

  it('returns the default for null/undefined/empty', () => {
    expect(parseDuration(undefined, DEFAULT)).toBe(DEFAULT)
    expect(parseDuration(null, DEFAULT)).toBe(DEFAULT)
    expect(parseDuration('', DEFAULT)).toBe(DEFAULT)
  })

  it('accepts a positive finite number (ms)', () => {
    expect(parseDuration(500, DEFAULT)).toBe(500)
    expect(parseDuration(0, DEFAULT)).toBe(0)
  })

  it('falls back to default for negative or non-finite numbers', () => {
    expect(parseDuration(-1, DEFAULT)).toBe(DEFAULT)
    expect(parseDuration(Number.NaN, DEFAULT)).toBe(DEFAULT)
    expect(parseDuration(Number.POSITIVE_INFINITY, DEFAULT)).toBe(DEFAULT)
  })

  it('parses unit suffixes', () => {
    expect(parseDuration('500ms', DEFAULT)).toBe(500)
    expect(parseDuration('30s', DEFAULT)).toBe(30_000)
    expect(parseDuration('15m', DEFAULT)).toBe(15 * 60_000)
    expect(parseDuration('2h', DEFAULT)).toBe(2 * 3_600_000)
    expect(parseDuration('7d', DEFAULT)).toBe(7 * 86_400_000)
  })

  it('treats a bare number string as milliseconds', () => {
    expect(parseDuration('250', DEFAULT)).toBe(250)
  })

  it('is case-insensitive and tolerates whitespace', () => {
    expect(parseDuration(' 1H ', DEFAULT)).toBe(3_600_000)
    expect(parseDuration('10S', DEFAULT)).toBe(10_000)
  })

  it('accepts decimal values', () => {
    expect(parseDuration('1.5h', DEFAULT)).toBe(Math.floor(1.5 * 3_600_000))
  })

  it('returns the default for garbage input', () => {
    expect(parseDuration('soon', DEFAULT)).toBe(DEFAULT)
    expect(parseDuration('5x', DEFAULT)).toBe(DEFAULT)
    expect(parseDuration('--5s', DEFAULT)).toBe(DEFAULT)
  })
})
