import { z } from 'zod'
import { variableIdParamsSchema } from '~~/server/database/zod'

const schema = z.object({
  autoUppercase: z.boolean().optional(),
  key: z.string({
    error: 'Variable key is required',
  }).min(1).trim(),
  values: z.array(z.object({
    environmentId: z.number({
      error: 'Environment ID is required',
    }),
    value: z.string().trim()
  })).min(1),
})

export default eventHandler(async (event) => {
  const { variableId } = await getValidatedRouterParams(event, variableIdParamsSchema.parse)
  const body = await readValidatedBody(event, schema.parse)
  await new VariablesService(event).updateVariable({
    id: variableId,
    key: body.key,
    values: body.values,
    autoUppercase: body.autoUppercase,
  })
  return {
    statusCode: 200,
    message: 'Variable updated successfully',
  }
})
