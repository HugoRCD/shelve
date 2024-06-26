import { H3Event } from 'h3'
import { removeMember } from '~~/server/app/teamsService'

export default eventHandler(async (event: H3Event) => {
  const { user } = event.context
  const teamId = getRouterParam(event, 'teamId') as string
  const memberId = getRouterParam(event, 'id') as string
  if (!teamId || !memberId) throw createError({ statusCode: 400, statusMessage: 'Missing params' })
  await removeMember(parseInt(teamId), parseInt(memberId), user.id)
  return {
    statusCode: 200,
    message: 'Member removed',
  }
})
