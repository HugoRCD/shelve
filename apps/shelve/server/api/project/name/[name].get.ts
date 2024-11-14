import type { H3Event } from 'h3'

export default eventHandler(async (event: H3Event) => {
  const paramName = getRouterParam(event, 'name')
  if (!paramName) throw createError({ statusCode: 400, statusMessage: 'Missing params' })
  const { user } = event.context
  const project = await prisma.project.findFirst({
    where: {
      name: {
        equals: decodeURIComponent(paramName),
        mode: 'insensitive',
      },
      ownerId: user.id,
    },
  })

  if (!project) throw createError({ statusCode: 400, statusMessage: 'Project not found' })

  return project
})
