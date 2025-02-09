import { projectIdParamsSchema } from '~~/server/database/zod'

export default eventHandler(async (event) => {
  const team = useCurrentTeam(event)

  const { projectId } = await getValidatedRouterParams(event, projectIdParamsSchema.parse)

  await new ProjectsService().deleteProject(projectId, team.id)

  return {
    statusCode: 200,
    message: 'Project deleted',
  }
})
