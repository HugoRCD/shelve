import { z, zh } from 'h3-zod'
import { VariablesService } from '~~/server/services/variables'
import { idParamsSchema } from '~~/server/database/zod'

const schema = z.object({
  projectId: z.number({
    required_error: 'Project ID is required',
  }).positive(),
  autoUppercase: z.boolean().optional(),
  key: z.string({
    required_error: 'Variable key is required',
  }).min(1).trim(),
  values: z.array(z.object({
    environmentId: z.number({
      required_error: 'Environment ID is required',
    }),
    value: z.string().trim()
  })).min(1),
})

export default eventHandler(async (event) => {
  const { id } = await zh.useValidatedParams(event, idParamsSchema)
  const body = await zh.useValidatedBody(event, schema)

  return await new VariablesService().updateVariable({
    id,
    projectId: body.projectId,
    key: body.key,
    values: body.values,
    autoUppercase: body.autoUppercase,
  })
})
