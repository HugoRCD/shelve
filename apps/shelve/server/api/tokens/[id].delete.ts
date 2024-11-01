import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const { user } = event.context
  const id = getRouterParam(event, 'id') as string

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing params' })

  await prisma.token.delete({
    where: {
      id: +id,
      userId: user.id,
    },
  })
})
