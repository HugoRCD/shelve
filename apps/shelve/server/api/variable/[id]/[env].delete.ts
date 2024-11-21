import { zh, z } from 'h3-zod'
import { EnvType } from '@shelve/types'
import { VariableService } from '~~/server/services/variable.service'

export default eventHandler(async (event) => {
  const { id, env } = await zh.useValidatedParams(event, {
    id: z.string({
      required_error: 'id is required',
    }).transform((value) => parseInt(value, 10)),
    env: z.string({
      required_error: 'env is required',
    }).transform((value) => value as EnvType),
  })
  await new VariableService().deleteVariable(id)
  return {
    statusCode: 200,
    message: 'Variable deleted',
  }
})
