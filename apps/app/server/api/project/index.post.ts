import { H3Event } from 'h3'
import { createProject } from '~/server/app/projectService'

export default eventHandler(async (event: H3Event) => {
  const user = event.context.user
  const projectCreateInput = await readBody(event)
  delete projectCreateInput.variables
  return await createProject(projectCreateInput, user.id)
})
