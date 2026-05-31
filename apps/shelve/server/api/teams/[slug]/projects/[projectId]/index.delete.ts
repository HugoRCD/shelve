import { TeamRole } from '@types'
import { projectIdParamsSchema } from '~~/server/db/zod'

export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug, { minRole: TeamRole.OWNER })

  const { projectId } = await getValidatedRouterParams(event, projectIdParamsSchema.parse)

  const project = await new ProjectsService().getProject(projectId)

  await new ProjectsService().deleteProject(projectId, team.id)

  await logAudit(event, {
    teamId: team.id,
    action: 'project.delete',
    resourceType: 'project',
    resourceId: projectId,
    metadata: { name: project.name },
  })

  return {
    statusCode: 200,
    message: 'Project deleted',
  }
})
