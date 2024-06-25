import { H3Event } from 'h3'
import { deleteTeam } from '~~/server/app/teamsService'

export default eventHandler(async (event: H3Event) => {
  const { user } = event.context
  const id = getRouterParam(event, 'teamId') as string
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing params' })
  await deleteTeam(parseInt(id), user.id)
  return {
    statusCode: 200,
    message: 'Team deleted',
  }
})
