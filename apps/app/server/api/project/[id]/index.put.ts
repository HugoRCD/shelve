import { H3Event } from 'h3'
import { updateProject } from '~/server/app/projectService'

export default eventHandler(async (event: H3Event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id') as string
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing params' })
  const projectUpdateInput = await readBody(event)
  delete projectUpdateInput.variables
  delete projectUpdateInput.team
  return await updateProject(projectUpdateInput, parseInt(id), user.id)
})
