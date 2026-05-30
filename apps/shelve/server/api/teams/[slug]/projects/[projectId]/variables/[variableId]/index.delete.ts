import { TeamRole } from '@types'
import { projectIdParamsSchema, variableIdParamsSchema } from '~~/server/db/zod'

export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug, { minRole: TeamRole.OWNER })
  const { variableId } = await getValidatedRouterParams(event, variableIdParamsSchema.parse)
  const { projectId } = await getValidatedRouterParams(event, projectIdParamsSchema.parse)

  const existing = await db.query.variables.findFirst({
    where: eq(schema.variables.id, variableId),
  })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Variable not found' })

  const project = await new ProjectsService().getProject(projectId)

  await new VariablesService(event).deleteVariable(variableId)

  await logAudit(event, {
    teamId: team.id,
    action: 'variables.delete',
    resourceType: 'variable',
    resourceId: variableId,
    metadata: {
      key: existing.key,
      projectId,
      projectName: project.name,
    },
  })

  return {
    statusCode: 200,
    message: 'Variable deleted',
  }
})
