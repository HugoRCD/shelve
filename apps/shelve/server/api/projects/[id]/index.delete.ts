import { zh } from 'h3-zod'
import { ProjectService } from '~~/server/services/project.service'
import { idParamsSchema } from '~~/server/database/zod'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { id } = await zh.useValidatedParams(event, idParamsSchema)
  await new ProjectService().deleteProject(id, user.id)
  return {
    statusCode: 200,
    message: 'Project deleted',
  }
})
