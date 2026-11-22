export default eventHandler(async (event) => {
  const { team, project } = await requireUserTeamProject(event, { projectWide: false })
  const variablesService = new VariablesService(event)
  variablesService.incrementStatAsync(team.id, 'pull')
  const encryptedVariables = await variablesService.getVariables(project.id)
  if (!encryptedVariables)
    throw createError({ statusCode: 404, statusMessage: 'Project variables not found' })

  const environmentIds = await getTokenScopeIds(event, 'environmentIds')
  const visibleVariables = environmentIds
    ? encryptedVariables
      .map(variable => ({ ...variable, values: variable.values.filter(value => environmentIds.includes(value.environmentId)) }))
      .filter(variable => variable.values.length)
    : encryptedVariables
  const variables = await variablesService.decryptVariables(visibleVariables)

  await logAudit(event, {
    teamId: team.id,
    action: 'variables.read',
    resourceType: 'project',
    resourceId: project.id,
    metadata: {
      projectId: project.id,
      projectName: project.name,
      environmentIds: [...new Set(visibleVariables.flatMap(variable => variable.values.map(value => value.environmentId)))],
    },
  })

  return variables
})
