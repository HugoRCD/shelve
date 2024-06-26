import { H3Event } from 'h3'
import prisma from '~~/server/database/client'
import { removeCachedUserToken } from '~~/server/app/userService'

export default eventHandler(async (event: H3Event) => {
  const { user } = event.context
  const id = getRouterParam(event, 'id') as string
  if (!id) throw createError({ statusCode: 400, statusMessage: 'missing params' })
  const deletedSession = await prisma.session.delete({
    where: {
      id: parseInt(id),
      userId: user.id,
    },
  })
  await removeCachedUserToken(deletedSession.authToken)
  return {
    statusCode: 200,
    message: 'session deleted',
  }
})
