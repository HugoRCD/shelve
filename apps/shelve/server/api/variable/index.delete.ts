import { VariableService } from '~~/server/services/variable.service'

export default defineEventHandler(async (event) => {
  const variableService = new VariableService()
  const { user } = event.context
  const body = await readBody(event)
  const variablesId = body.variables
  await variableService.deleteVariables(variablesId, user)
  return {
    statusCode: 200,
    message: 'Variables deleted',
  }
})
