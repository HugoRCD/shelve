import { projectIdParamsSchema } from '~~/server/database/zod'

export default eventHandler(async (event) => {
  const { projectId } = await getValidatedRouterParams(event, projectIdParamsSchema.parse)
  return await new ProjectsService().getProject(projectId)
})
