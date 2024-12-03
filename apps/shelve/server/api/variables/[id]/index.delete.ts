import { VariablesService } from '~~/server/services/variables'
import { idParamsSchema } from '~~/server/database/zod'

export default eventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, idParamsSchema.parse)
  await new VariablesService().deleteVariable(id)
  return {
    statusCode: 200,
    message: 'Variable deleted',
  }
})
