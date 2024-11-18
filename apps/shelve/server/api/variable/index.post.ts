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
  environment: z.enum(['production', 'preview', 'staging', 'development']).optional(),
})

const createVariablesSchema = baseSchema.extend({
  variables: z.array(variableSchema).min(1).max(100),
  method: z.enum(['merge', 'overwrite']).optional(),
})

const createVariableSchema = baseSchema.extend({
  variable: variableSchema,
})

const schema = z.discriminatedUnion('type', [
  createVariableSchema.extend({ type: z.literal('single') }),
  createVariablesSchema.extend({ type: z.literal('multiple') }),
])

export default eventHandler(async (event) => {
  const body = await zh.useValidatedBody(event, schema)
  const variableService = new VariableService()

  if (body.type === 'single') {
    return await variableService.createVariable({
      projectId: body.projectId,
      key: body.variable.key,
      value: body.variable.value,
      environment: body.environment || 'development',
      autoUppercase: body.autoUppercase
    })
  }

  return await variableService.createVariables({
    projectId: body.projectId,
    variables: body.variables,
    environment: body.environment,
    autoUppercase: body.autoUppercase,
    method: body.method
  })
})
