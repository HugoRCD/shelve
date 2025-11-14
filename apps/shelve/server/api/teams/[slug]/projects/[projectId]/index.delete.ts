import { TeamRole } from '@types'
import { projectIdParamsSchema } from '~~/server/database/zod'

import { getTeamSlugFromEvent, requireUserTeam } from '~~/server/utils/auth'

export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug, { minRole: TeamRole.OWNER })

  const { projectId } = await getValidatedRouterParams(event, projectIdParamsSchema.parse)

  await new ProjectsService().deleteProject(projectId, team.id)

  return {
    statusCode: 200,
    message: 'Project deleted',
  }
})
