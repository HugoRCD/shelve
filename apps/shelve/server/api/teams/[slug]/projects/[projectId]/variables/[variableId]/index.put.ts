import { z } from 'zod'
import { TeamRole } from '@types'
import { projectIdParamsSchema, variableIdParamsSchema } from '~~/server/db/zod'

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
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug, { minRole: TeamRole.ADMIN })
  const { variableId } = await getValidatedRouterParams(event, variableIdParamsSchema.parse)
  const { projectId } = await getValidatedRouterParams(event, projectIdParamsSchema.parse)
  const body = await readValidatedBody(event, updateVariableSchema.parse)

  const project = await new ProjectsService().getProject(projectId)
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

  await logAudit(event, {
    teamId: team.id,
    action: 'variables.update',
    resourceType: 'variable',
    resourceId: variableId,
    metadata: {
      key: body.autoUppercase ? body.key.toUpperCase() : body.key,
      projectId,
      projectName: project.name,
    },
  })

  return {
    statusCode: 200,
    message: 'Variable updated successfully',
  }
})
