import { Stats } from '@shelve/types'

export default defineEventHandler(async (event) => {
  const eventStream = createEventStream(event)
  const db = useDrizzle()

  const getStats = async (): Promise<Stats> => {
    const nbUsers = await db.query.users.findMany()
    const nbVariables = await db.query.variables.findMany()
    const nbTeams = await db.query.teams.findMany()
    const nbProjects = await db.query.projects.findMany()
    const teamStats = await db.query.teamStats.findMany()
    const nbPush = teamStats.reduce((acc, stat) => acc + stat.pushCount, 0)
    const nbPull = teamStats.reduce((acc, stat) => acc + stat.pullCount, 0)

    const totalActions = nbPush + nbPull
    const timeSavedInSeconds = totalActions * 417 // 7 minutes - 3 seconds

    return {
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
  }

  try {
    const initialStats = await getStats()
    eventStream.push(JSON.stringify(initialStats))

    const interval = setInterval(async () => {
      const stats = await getStats()
      eventStream.push(JSON.stringify(stats))
    }, 4000)

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
