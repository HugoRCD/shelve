import { zh, z } from 'h3-zod'
import type { UpdateVariableInput } from '@shelve/types'
import { VariablesService } from '~~/server/services/variables'
import { idParamsSchema } from '~~/server/database/zod'

const bodySchema = z.object({
  projectId: z.number({
    required_error: 'Project ID is required',
  }).positive(),
  key: z.string({
    required_error: 'Variable key is required',
  }).min(1).trim().optional(),
  value: z.string({
    required_error: 'Variable value is required',
  }).min(1).trim().optional(),
  env: z.string().optional(),
  autoUppercase: z.boolean().optional(),
})

export default eventHandler(async (event) => {
  const { id } = await zh.useValidatedParams(event, idParamsSchema)
  const body = await zh.useValidatedBody(event, bodySchema)
  const input: UpdateVariableInput = {
    id,
    projectId: body.projectId,
    key: body.key,
    value: body.value,
    environment: body.env,
    autoUppercase: body.autoUppercase,
  }
  await new VariablesService().updateVariable(input)
  return {
    statusCode: 200,
    message: 'Variable deleted',
  }
})
