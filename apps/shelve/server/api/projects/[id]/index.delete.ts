import { zh } from 'h3-zod'
import { ProjectsService } from '~~/server/services/projects'
import { idParamsSchema } from '~~/server/database/zod'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { id } = await zh.useValidatedParams(event, idParamsSchema)
  await new ProjectsService().deleteProject(id, user.id)
  return {
    statusCode: 200,
    message: 'Project deleted',
  }
})
