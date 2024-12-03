import { ProjectsService } from '~~/server/services/projects'
import { idParamsSchema } from '~~/server/database/zod'

export default eventHandler(async (event) => {
  const team = useCurrentTeam(event)

  const { id } = await getValidatedRouterParams(event, idParamsSchema.parse)

  await new ProjectsService().deleteProject(id, team.id)

  return {
    statusCode: 200,
    message: 'Project deleted',
  }
})
