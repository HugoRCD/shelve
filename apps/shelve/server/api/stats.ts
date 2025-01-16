import type { Stats } from '@shelve/types'

const STATS_CACHE_KEY = 'nitro:functions:stats:latest.json'
const CACHE_VALIDITY_DURATION = 1000 * 60 * 60 // 1 hour

export default defineEventHandler(async (event) => {
  const eventStream = createEventStream(event)
  const db = useDrizzle()
  const storage = useStorage('cache')

  const getStats = async (): Promise<Stats> => {
    const nbUsers = await db.query.users.findMany()
    const nbVariables = await db.query.variables.findMany()
    const nbTeams = await db.query.teams.findMany()
    const nbProjects = await db.query.projects.findMany()
    const teamStats = await db.query.teamStats.findMany()
    const nbPush = teamStats.reduce((acc, stat) => acc + stat.pushCount, 0)
    const nbPull = teamStats.reduce((acc, stat) => acc + stat.pullCount, 0)

    const totalActions = nbPush + nbPull
    const timeSavedInSeconds = totalActions * 417

    const stats: Stats = {
      users: {
        label: 'users',
        value: nbUsers.length
      },
      variables: {
        label: 'variables',
        value: nbVariables.length
      },
      teams: {
        label: 'teams',
        value: nbTeams.length
      },
      projects: {
        label: 'projects',
        value: nbProjects.length
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
