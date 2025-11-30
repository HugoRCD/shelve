import { z } from 'zod'
import { projectIdParamsSchema } from '~~/server/db/zod'

const createVariablesSchema = z.object({
  autoUppercase: z.boolean().optional(),
  environmentIds: z.array(z.number({
    error: 'Environment ID is required',
  })).min(1),
  variables: z.array(z.object({
    key: z.string({
      error: 'Variable key is required',
    }).min(1).trim(),
    value: z.string({
      error: 'Variable value is required',
    }).min(1).trim(),
  })).min(1).max(100),
  syncWithGitHub: z.boolean().optional(),
})

export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug)
  const body = await readValidatedBody(event, createVariablesSchema.parse)
  const { projectId } = await getValidatedRouterParams(event, projectIdParamsSchema.parse)

  const variablesService = new VariablesService(event)
  await variablesService.createVariables(event, {
    projectId,
    autoUppercase: body.autoUppercase,
    environmentIds: body.environmentIds,
    variables: body.variables.map(variable => ({
      key: variable.key,
      value: variable.value,
    })),
    syncWithGitHub: body.syncWithGitHub,
  })

  variablesService.incrementStatAsync(team.id, 'push')
  return {
    statusCode: 201,
    message: 'Variables created successfully',
  }
})
