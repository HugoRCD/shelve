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
  method: z.enum(['merge', 'overwrite']).optional(),
})

export default eventHandler(async (event) => {
  const body = await zh.useValidatedBody(event, schema)

  return await new VariablesService().upsertVariables({
    projectId: body.projectId,
    variables: body.variables,
    environmentIds: body.environmentIds,
    autoUppercase: body.autoUppercase,
    method: body.method
  })
})
