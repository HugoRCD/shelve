import { z } from 'zod'
import type { EnvVar } from '@shelve/types'
import { VariablesService } from '~~/server/services/variables'

export default eventHandler(async (event) => {
  const { id, envId } = await getValidatedRouterParams(event, z.object({
    id: z.coerce.number({
      required_error: 'Project ID is required',
    }).int().positive(),
    envId: z.coerce.number({
      required_error: 'Environment ID is required',
    }).int().positive(),
  }).parse)
  const variablesService = new VariablesService()
  const result = await variablesService.getVariables(id, envId)
  if (!result) throw createError({ statusCode: 404, message: `Variables not found for project ${id} and environment ${envId}` })
  const decryptedVariables = await variablesService.decryptVariables(result)
  const variables: EnvVar[] = decryptedVariables.map((variable) => {
    const value = variable.values.find((value) => value.environmentId === envId)
    return {
      key: variable.key,
      value: value!.value,
    }
  })
  return variables.filter((variable) => variable.value !== '')
})
