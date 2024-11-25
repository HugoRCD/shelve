import { zh } from 'h3-zod'
import { ProjectService } from '~~/server/services/project.service'
import { idParamsSchema } from '~~/server/database/zod'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { id } = await zh.useValidatedParams(event, idParamsSchema)
  return await new ProjectService().getProject(id, user.id)
})
