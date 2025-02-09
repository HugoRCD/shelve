import { z } from 'zod'
import { projectIdParamsSchema } from '~~/server/database/zod'

const schema = z.object({
  autoUppercase: z.boolean().optional(),
  environmentIds: z.array(z.number({
    required_error: 'Environment ID is required',
  })).min(1),
  variables: z.array(z.object({
    key: z.string({
      required_error: 'Variable key is required',
    }).min(1).trim(),
    value: z.string({
      required_error: 'Variable value is required',
    }).min(1).trim(),
  })).min(1).max(100),
})

export default eventHandler(async (event) => {
  const team = useCurrentTeam(event)
  const body = await readValidatedBody(event, schema.parse)
  const { projectId } = await getValidatedRouterParams(event, projectIdParamsSchema.parse)

  const variablesService = new VariablesService(event)
  await variablesService.createVariables({
    projectId,
    autoUppercase: body.autoUppercase,
    environmentIds: body.environmentIds,
    variables: body.variables.map(variable => ({
      key: variable.key,
      value: variable.value,
    }))
  })

  variablesService.incrementStatAsync(team.id, 'push')
  return {
    statusCode: 201,
    message: 'Variables created successfully',
  }
})
