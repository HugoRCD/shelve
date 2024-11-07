import type { H3Event } from 'h3'
import { TeamService } from '~~/server/services/teams.service'

export default eventHandler(async (event: H3Event) => {
  const { user } = event.context
  const teamId = getRouterParam(event, 'teamId') as string
  if (!teamId) throw createError({ statusCode: 400, statusMessage: 'Missing params' })
  const addMemberInput = await readBody(event)
  return await new TeamService().upsertMember(+teamId, addMemberInput, user.id)
})
