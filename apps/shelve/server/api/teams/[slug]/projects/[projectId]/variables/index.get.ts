import { VariablesService } from '~~/server/services/variables'
import { projectIdParamsSchema } from '~~/server/database/zod'

export default eventHandler(async (event) => {
  const { projectId } = await getValidatedRouterParams(event, projectIdParamsSchema.parse)
  const variableService = new VariablesService()
  const encryptedVariables = await variableService.getVariables(projectId)
  if (!encryptedVariables)
    throw createError({ statusCode: 404, statusMessage: 'Project variables not found' })
  return await variableService.decryptVariables(encryptedVariables)
})
