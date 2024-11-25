import { zh } from 'h3-zod'
import { VariablesService } from '~~/server/services/variables'
import { idParamsSchema } from '~~/server/database/zod'

export default eventHandler(async (event) => {
  const { id } = await zh.useValidatedParams(event, idParamsSchema)
  await new VariablesService().deleteVariable(id)
  return {
    statusCode: 200,
    message: 'Variable deleted',
  }
})
