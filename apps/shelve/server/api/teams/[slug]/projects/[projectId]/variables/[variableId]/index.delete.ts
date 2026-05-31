import { TeamRole } from '@types'
import { variableIdParamsSchema } from '~~/server/db/zod'

export default eventHandler(async (event) => {
  const { team, project } = await requireUserTeamProject(event, { minRole: TeamRole.OWNER })
  const { variableId } = await getValidatedRouterParams(event, variableIdParamsSchema.parse)

  const existing = await db.query.variables.findFirst({
    where: and(
      eq(schema.variables.id, variableId),
      eq(schema.variables.projectId, project.id),
    ),
  })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Variable not found' })

  await new VariablesService(event).deleteVariable(variableId)

  void logAudit(event, {
    teamId: team.id,
    action: 'variables.delete',
    resourceType: 'variable',
    resourceId: variableId,
    metadata: {
      key: existing.key,
      projectId: project.id,
      projectName: project.name,
    },
  })

  return {
    statusCode: 200,
    message: 'Variable deleted',
  }
})
