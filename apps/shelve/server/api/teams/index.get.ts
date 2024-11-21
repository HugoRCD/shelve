import { TeamService } from '~~/server/services/teams.service'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  return new TeamService().getTeamsByUserId(user.id)
})
