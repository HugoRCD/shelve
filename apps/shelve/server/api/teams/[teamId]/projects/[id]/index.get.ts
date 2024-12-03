import { ProjectsService } from '~~/server/services/projects'
import { idParamsSchema } from '~~/server/database/zod'

export default eventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, idParamsSchema.parse)
  return await new ProjectsService().getProject(id)
})
