import { H3Event } from 'h3'
import prisma from '~~/server/database/client'

export default defineEventHandler(async (event: H3Event) => {
  const { user } = event.context
  const id = getRouterParam(event, 'id') as string

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing params' })

  await prisma.cliToken.delete({
    where: {
      id: +id,
      userId: user.id,
    },
  })
})
