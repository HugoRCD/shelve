import { z } from 'zod'

const createVariablesSchema = z.object({
  autoUppercase: z.boolean().optional(),
  environmentIds: z.array(z.number({
    error: 'Environment ID is required',
  })).min(1),
  variables: z.array(z.object({
    key: z.string({
      error: 'Variable key is required',
    }).min(1).trim(),
    value: z.string({
      error: 'Variable value is required',
    }).min(1).trim(),
    description: z.string().max(500).trim().optional(),
  })).min(1).max(100),
  syncWithGitHub: z.boolean().optional(),
})

export default eventHandler(async (event) => {
  const { team, project } = await requireUserTeamProject(event)
  const body = await readValidatedBody(event, createVariablesSchema.parse)

  await assertPushAllowedForEnvironmentIds(body.environmentIds, team.id, project.syncPolicy)

  for (const environmentId of body.environmentIds) {
    await requireTokenScope(event, {
      teamId: team.id,
      projectId: project.id,
      environmentId,
      permission: 'write',
    })
  }

  const variablesService = new VariablesService(event)
  await variablesService.createVariables(event, {
    projectId: project.id,
    autoUppercase: body.autoUppercase,
    environmentIds: body.environmentIds,
    variables: body.variables.map(variable => ({
      key: variable.key,
      value: variable.value,
      description: variable.description,
    })),
    syncWithGitHub: body.syncWithGitHub,
  })

  variablesService.incrementStatAsync(team.id, 'push')

  await logAudit(event, {
    teamId: team.id,
    action: 'variables.create',
    resourceType: 'project',
    resourceId: project.id,
    metadata: {
      keys: body.variables.map(v => v.key),
      environmentIds: body.environmentIds,
      projectName: project.name,
      syncWithGitHub: body.syncWithGitHub === true,
    },
  })

  return {
    statusCode: 201,
    message: 'Variables created successfully',
  }
})
