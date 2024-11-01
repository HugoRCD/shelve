import type { H3Event } from 'h3'
import { TeamService } from '~~/server/services/teams.service'

export default eventHandler((event: H3Event) => {
  const teamService = new TeamService()
  const { user } = event.context
  return teamService.getTeamByUserId(user.id)
})
