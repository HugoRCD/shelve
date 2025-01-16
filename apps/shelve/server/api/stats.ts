export default defineEventHandler(async (event) => {
  const eventStream = createEventStream(event)
  const db = useDrizzle()

  const getStats = async () => {
    const nbUsers = await db.query.users.findMany()
    const nbVariables = await db.query.variables.findMany()
    const nbTeams = await db.query.teams.findMany()
    const nbProjects = await db.query.projects.findMany()

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
