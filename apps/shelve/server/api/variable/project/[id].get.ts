import { zh } from 'h3-zod'
import { VariableService } from '~~/server/services/variable.service'
import { idParamsSchema } from '~~/server/database/zod'

export default eventHandler(async (event) => {
  const { id } = await zh.useValidatedParams(event, idParamsSchema)
  return await new VariableService().getProjectVariables(id)
})
