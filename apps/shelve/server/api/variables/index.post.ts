import { z, zh } from 'h3-zod'
import { VariablesService } from '~~/server/services/variables'

const schema = z.object({
  projectId: z.number({
    required_error: 'Project ID is required',
  }).positive(),
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
  const body = await zh.useValidatedBody(event, schema)

  const input = {
    projectId: body.projectId,
    autoUppercase: body.autoUppercase,
    environmentIds: body.environmentIds,
    variables: body.variables.map(variable => ({
      key: variable.key,
      value: variable.value,
    }))
  }
  await new VariablesService().createVariables(input)
  return {
    statusCode: 201,
    message: 'Variables created successfully',
  }
})
