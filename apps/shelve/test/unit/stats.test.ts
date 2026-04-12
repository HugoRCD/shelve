import { describe, test, expect } from 'vitest'
import { calculateStats, STATS_CACHE_KEY, STATS_CACHE_REVALIDATE_AFTER } from '../../server/utils/stats'

describe('calculateStats', () => {
  test('computes correct counts from data arrays', () => {
    const stats = calculateStats({
      users: [{}, {}, {}],
      variables: [{}, {}],
      teams: [{}],
      projects: [{}, {}, {}, {}],
      teamStats: [
        { pushCount: 10, pullCount: 5 },
        { pushCount: 20, pullCount: 15 },
      ],
    })

    expect(stats.users).toEqual({ label: 'users', value: 3 })
    expect(stats.variables).toEqual({ label: 'variables', value: 2 })
    expect(stats.teams).toEqual({ label: 'teams', value: 1 })
    expect(stats.projects).toEqual({ label: 'projects', value: 4 })
    expect(stats.push).toEqual({ label: 'push', value: 30 })
    expect(stats.pull).toEqual({ label: 'pull', value: 20 })
  })

  test('calculates saved time correctly', () => {
    const stats = calculateStats({
      users: [],
      variables: [],
      teams: [],
      projects: [],
      teamStats: [
        { pushCount: 100, pullCount: 200 },
      ],
    })

    const totalActions = 300
    const timeSaved = totalActions * (300 - 4)

    expect(stats.savedTime.seconds).toBe(timeSaved)
    expect(stats.savedTime.minutes).toBe(Math.floor(timeSaved / 60))
    expect(stats.savedTime.hours).toBe(Math.floor(timeSaved / 3600))
  })

  test('handles empty data', () => {
    const stats = calculateStats({
      users: [],
      variables: [],
      teams: [],
      projects: [],
      teamStats: [],
    })

    expect(stats.users.value).toBe(0)
    expect(stats.variables.value).toBe(0)
    expect(stats.teams.value).toBe(0)
    expect(stats.projects.value).toBe(0)
    expect(stats.push.value).toBe(0)
    expect(stats.pull.value).toBe(0)
    expect(stats.savedTime.seconds).toBe(0)
    expect(stats.savedTime.minutes).toBe(0)
    expect(stats.savedTime.hours).toBe(0)
  })

  test('handles single team stats', () => {
    const stats = calculateStats({
      users: [{}],
      variables: [{}],
      teams: [{}],
      projects: [{}],
      teamStats: [{ pushCount: 1, pullCount: 0 }],
    })

    expect(stats.push.value).toBe(1)
    expect(stats.pull.value).toBe(0)
    expect(stats.savedTime.seconds).toBe(296)
  })
})

describe('stats constants', () => {
  test('cache key is defined', () => {
    expect(STATS_CACHE_KEY).toBe('nitro:functions:stats:latest.json')
  })

  test('revalidate interval is 5 minutes', () => {
    expect(STATS_CACHE_REVALIDATE_AFTER).toBe(300_000)
  })
})
