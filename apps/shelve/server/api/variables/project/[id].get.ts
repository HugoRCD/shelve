import { zh } from 'h3-zod'
import { VariablesService } from '~~/server/services/variables'
import { idParamsSchema } from '~~/server/database/zod'

export default eventHandler(async (event) => {
  const { id } = await zh.useValidatedParams(event, idParamsSchema)
  const variableService = new VariablesService()
  const encryptedVariables = await variableService.getVariables(id)
  if (!encryptedVariables)
    throw createError({ statusCode: 404, statusMessage: 'Project variables not found' })
  return await variableService.decryptVariables(encryptedVariables)
})
