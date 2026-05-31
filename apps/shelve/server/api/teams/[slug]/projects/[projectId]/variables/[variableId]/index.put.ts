import { z } from 'zod'
import { TeamRole } from '@types'
import { variableIdParamsSchema } from '~~/server/db/zod'

const updateVariableSchema = z.object({
  autoUppercase: z.boolean().optional(),
  key: z.string({
    error: 'Variable key is required',
  }).min(1).trim(),
  description: z.string().max(500).trim().nullish(),
  groupId: z.number().int().positive().nullish(),
  values: z.array(z.object({
    environmentId: z.number({
      error: 'Environment ID is required',
    }),
    value: z.string().trim()
  })).min(1),
})

export default eventHandler(async (event) => {
  const { team, project } = await requireUserTeamProject(event, { minRole: TeamRole.ADMIN })
  const { variableId } = await getValidatedRouterParams(event, variableIdParamsSchema.parse)
  const body = await readValidatedBody(event, updateVariableSchema.parse)

  const existing = await db.query.variables.findFirst({
    where: and(
      eq(schema.variables.id, variableId),
      eq(schema.variables.projectId, project.id),
    ),
  })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Variable not found' })

  if (body.groupId != null) {
    await new VariableGroupsService().getGroupForProject(body.groupId, project.id)
  }

  const environmentIds = [...new Set(body.values.map(v => v.environmentId))]
  await assertPushAllowedForEnvironmentIds(environmentIds, team.id, project.syncPolicy)

  await new VariablesService(event).updateVariable({
    id: variableId,
    key: body.key,
    description: body.description,
    groupId: body.groupId,
    values: body.values,
    autoUppercase: body.autoUppercase,
  })

  void logAudit(event, {
    teamId: team.id,
    action: 'variables.update',
    resourceType: 'variable',
    resourceId: variableId,
    metadata: {
      key: body.autoUppercase ? body.key.toUpperCase() : body.key,
      projectId: project.id,
      projectName: project.name,
    },
  })

  return {
    statusCode: 200,
    message: 'Variable updated successfully',
  }
})
