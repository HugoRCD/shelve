import { zh, z } from 'h3-zod'
import { VariableService } from '~~/server/services/variable.service'

export default eventHandler(async (event) => {
  const { id } = await zh.useValidatedParams(event, {
    id: z.string({
      required_error: 'id is required',
    }).transform((value) => parseInt(value, 10)),
  })
  return await new VariableService().getVariableById(id)
})
