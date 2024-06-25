import { H3Event } from 'h3'
import prisma from '~~/server/database/client'

export default eventHandler(async (event: H3Event) => {
  const paramName = getRouterParam(event, 'name')
  if (!paramName) throw createError({ statusCode: 400, statusMessage: 'Missing params' })
  return await prisma.project.findFirst({
    where: {
      name: {
        equals: decodeURIComponent(paramName),
        mode: 'insensitive',
      },
    },
  })
})
