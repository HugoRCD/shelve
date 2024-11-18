import { zh, z } from 'h3-zod'
import type { UpdateVariableInput } from '@shelve/types'
import { VariableService } from '~~/server/services/variable.service'

export default eventHandler(async (event) => {
  const params = await zh.useValidatedParams(event, {
    id: z.string({
      required_error: 'id is required',
    }).transform((value) => parseInt(value, 10)),
  })
  const body = await zh.useValidatedBody(event, {
    id: z.string({
      required_error: 'id is required',
    }).transform((value) => parseInt(value, 10)),
    key: z.string({
      required_error: 'Variable key is required',
    }).min(1).max(255).trim().optional(),
    value: z.string({
      required_error: 'Variable value is required',
    }).min(1).max(255).trim().optional(),
    env: z.enum(['production', 'preview', 'staging', 'development']).optional(),
    autoUppercase: z.boolean().optional(),
  })
  const input: UpdateVariableInput = {
    id: params.id,
    projectId: body.id,
    key: body.key,
    value: body.value,
    environment: body.env,
    autoUppercase: body.autoUppercase,
  }
  await new VariableService().updateVariable(input)
  return {
    statusCode: 200,
    message: 'Variable deleted',
  }
})
