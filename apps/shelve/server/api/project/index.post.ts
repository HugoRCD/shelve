import type { H3Event } from 'h3'
import { ProjectService } from '~~/server/services/project.service'

export default eventHandler(async (event: H3Event) => {
  const projectService = new ProjectService()
  const { user } = event.context
  const projectCreateInput = await readBody(event)
  delete projectCreateInput.variables
  projectCreateInput.name = projectCreateInput.name.trim()
  return await projectService.createProject(projectCreateInput, user.id)
})
