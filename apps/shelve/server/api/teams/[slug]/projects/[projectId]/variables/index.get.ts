export default eventHandler(async (event) => {
  const { team, project } = await requireUserTeamProject(event)
  const variablesService = new VariablesService(event)
  variablesService.incrementStatAsync(team.id, 'pull')
  const encryptedVariables = await variablesService.getVariables(project.id)
  if (!encryptedVariables)
    throw createError({ statusCode: 404, statusMessage: 'Project variables not found' })
  return await variablesService.decryptVariables(encryptedVariables)
})
