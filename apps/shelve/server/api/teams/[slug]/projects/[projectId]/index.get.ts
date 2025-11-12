import { projectIdParamsSchema } from '~~/server/database/zod'
import { getTeamSlugFromEvent, requireUserTeam } from '~~/server/utils/auth'

export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  await requireUserTeam(event, slug)
  const { projectId } = await getValidatedRouterParams(event, projectIdParamsSchema.parse)
  return await new ProjectsService().getProject(projectId)
})
