import type { H3Event } from 'h3'
import { ProjectService } from '~~/server/services/project.service'

export default eventHandler(async (event: H3Event) => {
  const projectService = new ProjectService()
  const { user } = event.context
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })
  return await projectService.getProjectsByUserId(user.id)
})
