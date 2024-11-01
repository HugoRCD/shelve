import type { H3Event } from 'h3'
import { TeamService } from '~~/server/services/teams.service'

export default eventHandler(async (event: H3Event) => {
  const { user } = event.context
  const teamId = getRouterParam(event, 'teamId') as string
  if (!teamId) throw createError({ statusCode: 400, statusMessage: 'Missing params' })
  const teamService = new TeamService()
  const addMemberInput = await readBody(event)
  return await teamService.upsertMember(+teamId, addMemberInput, user.id)
})
