import { z, zh } from 'h3-zod'
import { VariableService } from '~~/server/services/variable.service'

const variableSchema = z.object({
  key: z.string({
    required_error: 'Variable key is required',
  }).min(1).max(255).trim(),
  value: z.string({
    required_error: 'Variable value is required',
  }).min(1).max(255).trim(),
})

const baseSchema = z.object({
  projectId: z.number({
    required_error: 'Project ID is required',
  }).positive(),
  autoUppercase: z.boolean().optional(),
  environment: z.string().optional(),
})

const schema = baseSchema.extend({
  variables: z.array(variableSchema).min(1).max(100),
  method: z.enum(['merge', 'overwrite']).optional(),
})

export default eventHandler(async (event) => {
  const body = await zh.useValidatedBody(event, schema)
  const variableService = new VariableService()

  return await variableService.createVariables({
    projectId: body.projectId,
    variables: body.variables,
    environment: body.environment,
    autoUppercase: body.autoUppercase,
    method: body.method
  })
})
