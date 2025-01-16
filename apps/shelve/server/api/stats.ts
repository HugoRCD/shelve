import type { Stats } from '@shelve/types'

const STATS_CACHE_KEY = 'nitro:functions:stats:latest.json'
const CACHE_VALIDITY_DURATION = 1000 * 60 * 60 // 1 hour

export default defineEventHandler(async (event) => {
  const eventStream = createEventStream(event)
  const db = useDrizzle()
  const storage = useStorage('cache')

  const calculateStats = (data: {
    users: any[],
    variables: any[],
    teams: any[],
    projects: any[],
    teamStats: any[]
  }): Stats => {
    const nbPush = data.teamStats.reduce((acc, stat) => acc + stat.pushCount, 0)
    const nbPull = data.teamStats.reduce((acc, stat) => acc + stat.pullCount, 0)
    const totalActions = nbPush + nbPull

    const MANUAL_PROCESS_TIME = 300
    const SHELVE_PROCESS_TIME = 4
    const TIME_SAVED_PER_ACTION = MANUAL_PROCESS_TIME - SHELVE_PROCESS_TIME
    const timeSavedInSeconds = totalActions * TIME_SAVED_PER_ACTION

    return {
      users: {
        label: 'users',
        value: data.users.length
      },
      variables: {
        label: 'variables',
        value: data.variables.length
      },
      teams: {
        label: 'teams',
        value: data.teams.length
      },
      projects: {
        label: 'projects',
        value: data.projects.length
      },
      push: {
        label: 'push',
        value: nbPush
      },
      pull: {
        label: 'pull',
        value: nbPull
      },
      savedTime: {
        seconds: timeSavedInSeconds,
        minutes: Math.floor(timeSavedInSeconds / 60),
        hours: Math.floor(timeSavedInSeconds / 3600)
      }
    }
  }

  const getStats = async (): Promise<Stats> => {
    const [users, variables, teams, projects, teamStats] = await Promise.all([
      db.query.users.findMany(),
      db.query.variables.findMany(),
      db.query.teams.findMany(),
      db.query.projects.findMany(),
      db.query.teamStats.findMany()
    ])

    const stats = calculateStats({ users, variables, teams, projects, teamStats })

    await storage.setItem(STATS_CACHE_KEY, {
      stats,
      timestamp: Date.now()
    })

    return stats
  }

  const getCachedOrFreshStats = async (): Promise<Stats> => {
    const cached = await storage.getItem(STATS_CACHE_KEY)

    if (cached) {
      const { stats, timestamp } = cached as { stats: Stats, timestamp: number }
      const now = Date.now()

      if (now - timestamp >= CACHE_VALIDITY_DURATION) {
        getStats().catch(console.error)
      }

      return stats
    }

    return getStats()
  }

  try {
    const initialStats = await getCachedOrFreshStats()
    eventStream.push(JSON.stringify(initialStats))

    const interval = setInterval(async () => {
      const stats = await getStats()
      eventStream.push(JSON.stringify(stats))
    }, 2000)

    eventStream.onClosed(async () => {
      clearInterval(interval)
      await eventStream.close()
    })

    return eventStream.send()
  } catch (error) {
    await eventStream.close()
    throw error
  }
})
