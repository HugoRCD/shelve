import { H3Event } from 'h3'
import prisma from '~/server/database/client'

export default eventHandler(async (event: H3Event) => {
  const user = event.context.user
  const body = await readBody(event)
  const id = getRouterParam(event, 'userId') as string

  if (!id) throw createError({ statusCode: 400, statusMessage: 'missing params' })
  if (user.id === parseInt(id)) throw createError({ statusCode: 400, statusMessage: 'you can\'t update your own role' })

  await prisma.user.update({
    where: { id: parseInt(id) },
    data: {
      role: body.role,
    },
  })
  return {
    statusCode: 200,
    message: 'user updated',
  }
})
