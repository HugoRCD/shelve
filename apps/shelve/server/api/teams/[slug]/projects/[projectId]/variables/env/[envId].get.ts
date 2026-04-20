import { z } from 'zod'
import type { EnvVarExport } from '@types'
import { projectIdParamsSchema } from '~~/server/db/zod'

export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug)
  const { projectId } = await getValidatedRouterParams(event, projectIdParamsSchema.parse)
  const { envId } = await getValidatedRouterParams(event, z.object({
    envId: z.coerce.number({
      error: 'Environment ID is required',
    }).int().positive(),
  }).parse)

  await requireTokenScope(event, {
    teamId: team.id,
    projectId,
    environmentId: envId,
    permission: 'read',
  })

  const variablesService = new VariablesService(event)

  variablesService.incrementStatAsync(team.id, 'pull')
  const result = await variablesService.getVariables(projectId, envId)

  if (!result) throw createError({ statusCode: 404, statusMessage: `Variables not found for project ${projectId} and environment ${envId}` })

  const decryptedVariables = await variablesService.decryptVariables(result)

  const variables: EnvVarExport[] = decryptedVariables.map((variable) => {
    const value = variable.values.find((value) => value.environmentId === envId)
    return {
      key: variable.key,
      value: value!.value,
      description: variable.description || undefined,
      group: variable.group
        ? { name: variable.group.name, description: variable.group.description }
        : undefined,
    }
  })

  return variables.filter((variable) => variable.value !== '')
})
