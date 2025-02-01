import { VariablesService } from '~~/server/services/variables'
import { variableIdParamsSchema } from '~~/server/database/zod'

export default eventHandler(async (event) => {
  const { variableId } = await getValidatedRouterParams(event, variableIdParamsSchema.parse)

  await new VariablesService(event).deleteVariable(variableId)

  return {
    statusCode: 200,
    message: 'Variable deleted',
  }
})
