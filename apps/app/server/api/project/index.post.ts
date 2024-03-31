import { H3Event } from 'h3'
import { createProject } from '~/server/app/projectService'

export default eventHandler(async (event: H3Event) => {
  const user = event.context.user
  const projectCreateInput = await readBody(event)
  delete projectCreateInput.variables
  projectCreateInput.name = projectCreateInput.name.trim()
  return await createProject(projectCreateInput, user.id)
})
