import { H3Event } from 'h3'
import { upsertMember } from '~/server/app/teamsService'

export default eventHandler(async (event: H3Event) => {
  const user = event.context.user
  const teamId = getRouterParam(event, 'teamId') as string
  if (!teamId) throw createError({ statusCode: 400, statusMessage: 'Missing params' })
  const addMemberInput = await readBody(event)
  return await upsertMember(parseInt(teamId), addMemberInput, user.id)
})
