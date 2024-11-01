import type { H3Event } from 'h3'
import { TeamService } from '~~/server/services/teams.service'

export default eventHandler(async (event: H3Event) => {
  const { user } = event.context
  const id = getRouterParam(event, 'teamId') as string
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing params' })
  const teamService = new TeamService()
  await teamService.deleteTeam({
    teamId: parseInt(id),
    userId: user.id,
    userRole: user.role,
  })
  return {
    statusCode: 200,
    message: 'Team deleted',
  }
})
