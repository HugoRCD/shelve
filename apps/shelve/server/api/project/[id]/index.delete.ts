import type { H3Event } from 'h3'
import { ProjectService } from '~~/server/services/project.service'

export default eventHandler(async (event: H3Event) => {
  const { user } = event.context
  const id = getRouterParam(event, 'id') as string
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing params' })
  const projectService = new ProjectService()
  await projectService.deleteProject(id, user.id)
  return {
    statusCode: 200,
    message: 'Project deleted',
  }
})
