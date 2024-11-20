import { zh, z } from 'h3-zod'
import type { Environment } from '@shelve/types'
import { VariableService } from '~~/server/services/variable.service'

export default eventHandler(async (event) => {
  const { id, env } = await zh.useValidatedParams(event, {
    id: z.string({
      required_error: 'Project ID is required',
    }).transform((value) => parseInt(value, 10)),
    env: z.string({
      required_error: 'Environment is required',
    }).transform((value) => value as Environment),
  })
  return await new VariableService().getVariableByIdAndEnv(id, env)
})
