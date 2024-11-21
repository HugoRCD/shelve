import { z, zh } from 'h3-zod'
import { VariableService } from '~~/server/services/variable.service'

const schema = z.object({
  projectId: z.number({
    required_error: 'Project ID is required',
  }).positive(),
  autoUppercase: z.boolean().optional(),
  environment: z.string().optional(),
  variables: z.array(z.object({
    key: z.string({
      required_error: 'Variable key is required',
    }).min(1).trim(),
    value: z.string({
      required_error: 'Variable value is required',
    }).min(1).trim(),
  })).min(1).max(100),
  method: z.enum(['merge', 'overwrite']).optional(),
})

export default eventHandler(async (event) => {
  const body = await zh.useValidatedBody(event, schema)

  return await new VariableService().createVariables({
    projectId: body.projectId,
    variables: body.variables,
    environment: body.environment,
    autoUppercase: body.autoUppercase,
    method: body.method
  })
})
