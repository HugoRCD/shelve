import { z } from 'zod'
import type { EnvVar } from '~~/packages/types'
import { VariablesService } from '~~/server/services/variables'
import { projectIdParamsSchema } from '~~/server/database/zod'

export default eventHandler(async (event) => {
  const team = useCurrentTeam(event)
  const { projectId } = await getValidatedRouterParams(event, projectIdParamsSchema.parse)
  const { envId } = await getValidatedRouterParams(event, z.object({
    envId: z.coerce.number({
      required_error: 'Environment ID is required',
    }).int().positive(),
  }).parse)

  const variablesService = new VariablesService()

  variablesService.incrementStatAsync(team.id, 'pull')
  const result = await variablesService.getVariables(projectId, envId)

  if (!result) throw createError({ statusCode: 404, statusMessage: `Variables not found for project ${projectId} and environment ${envId}` })

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
