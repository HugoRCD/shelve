import type { H3Event } from 'h3'
import { TeamService } from '~~/server/services/teams.service'

export default eventHandler((event: H3Event) => {
  const { user } = event.context
  return new TeamService().getTeamsByUserId(user.id)
})
