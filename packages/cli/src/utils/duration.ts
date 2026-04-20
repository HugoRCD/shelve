/**
 * Parses a human-readable duration into milliseconds.
 *
 * Accepted forms: `"24h"`, `"15m"`, `"30s"`, `"7d"`, `"500"` (ms),
 * or a plain number (treated as milliseconds).
 *
 * Returns `null` for invalid input. Use `defaultMs` to provide a fallback.
 */
export function parseDuration(input: string | number | undefined | null, defaultMs: number): number {
  if (input === undefined || input === null || input === '') return defaultMs
  if (typeof input === 'number') return Number.isFinite(input) && input >= 0 ? input : defaultMs

  const trimmed = input.trim()
  const match = /^(\d+(?:\.\d+)?)\s*(ms|s|m|h|d)?$/i.exec(trimmed)
  if (!match) return defaultMs

  const value = parseFloat(match[1]!)
  const unit = (match[2] ?? 'ms').toLowerCase()
  const multipliers: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  }
  const mult = multipliers[unit]
  if (mult === undefined) return defaultMs
  return Math.floor(value * mult)
}
