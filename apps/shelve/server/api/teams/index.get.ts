import { TeamService } from '~~/server/services/teams.service'

export default eventHandler((event) => {
  return new TeamService().getTeamsByUserId(event.context.user.id)
})
