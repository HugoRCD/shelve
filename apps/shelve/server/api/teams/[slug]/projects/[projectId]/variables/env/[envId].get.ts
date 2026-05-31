import { z } from 'zod'
import type { EnvVarExport } from '@types'

export default eventHandler(async (event) => {
  const { team, project } = await requireUserTeamProject(event)
  const { envId } = await getValidatedRouterParams(event, z.object({
    envId: z.coerce.number({
      error: 'Environment ID is required',
    }).int().positive(),
  }).parse)

  await requireTokenScope(event, {
    teamId: team.id,
    projectId: project.id,
    environmentId: envId,
    permission: 'read',
  })

  const variablesService = new VariablesService(event)
  const environmentName = await getEnvironmentName(envId, team.id)

  void logAudit(event, {
    teamId: team.id,
    action: 'variables.read',
    resourceType: 'environment',
    resourceId: envId,
    metadata: {
      projectId: project.id,
      projectName: project.name,
      environmentName,
    },
  })

  variablesService.incrementStatAsync(team.id, 'pull')
  const result = await variablesService.getVariables(project.id, envId)

  if (!result) throw createError({ statusCode: 404, statusMessage: `Variables not found for project ${project.id} and environment ${envId}` })

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
