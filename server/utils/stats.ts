import type { Stats } from '~~/packages/types'

export const STATS_CACHE_KEY = 'stats:latest.json'
export const STATS_CACHE_REVALIDATE_AFTER = 1000 * 60 * 5 // 5 minutes

const calculateStats = (data: {
  users: any[]
  variables: any[]
  teams: any[]
  projects: any[]
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
    users: { label: 'users', value: data.users.length },
    variables: { label: 'variables', value: data.variables.length },
    teams: { label: 'teams', value: data.teams.length },
    projects: { label: 'projects', value: data.projects.length },
    push: { label: 'push', value: nbPush },
    pull: { label: 'pull', value: nbPull },
    savedTime: {
      seconds: timeSavedInSeconds,
      minutes: Math.floor(timeSavedInSeconds / 60),
      hours: Math.floor(timeSavedInSeconds / 3600)
    }
  }
}

export const getStats = async (): Promise<Stats> => {
  const db = useDrizzle()

  const [users, variables, teams, projects, teamStats] = await Promise.all([
    db.query.users.findMany(),
    db.query.variables.findMany(),
    db.query.teams.findMany(),
    db.query.projects.findMany(),
    db.query.teamStats.findMany()
  ])

  return calculateStats({ users, variables, teams, projects, teamStats })
}
