import type { H3Event } from 'h3'
import { z, zh } from 'h3-zod'
import { ProjectService } from '~~/server/services/project.service'

export default eventHandler(async (event: H3Event) => {
  const id = getRouterParam(event, 'id') as string
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing params' })
  const projectService = new ProjectService()
  return await projectService.getProjectById(+id, event.context.user.id)
})
