import type { H3Event } from 'h3'
import { TeamService } from '~~/server/services/teams.service'

export default eventHandler(async (event: H3Event) => {
  const { user } = event.context
  const teamId = getRouterParam(event, 'teamId') as string
  const memberId = getRouterParam(event, 'id') as string
  if (!teamId || !memberId) throw createError({ statusCode: 400, statusMessage: 'Missing params' })
  const teamService = new TeamService()
  await teamService.removeMember(+teamId, +memberId, user.id)
  return {
    statusCode: 200,
    message: 'Member removed',
  }
})
