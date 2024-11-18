import type { H3Event } from 'h3'
import { z, zh } from 'h3-zod'
import { ProjectService } from '~~/server/services/project.service'

export default eventHandler(async (event: H3Event) => {
  const { user } = event.context
  const id = getRouterParam(event, 'id') as string
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing params' })
  const projectService = new ProjectService()
  const projectUpdateInput = await readBody(event)
  delete projectUpdateInput.variables
  delete projectUpdateInput.team
  projectUpdateInput.name = projectUpdateInput.name.trim()
  return await projectService.updateProject(projectUpdateInput, +id, user.id)
})
