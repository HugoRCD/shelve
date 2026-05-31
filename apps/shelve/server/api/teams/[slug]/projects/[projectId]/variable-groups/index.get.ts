export default eventHandler(async (event) => {
  const { project } = await requireUserTeamProject(event)
  return await new VariableGroupsService().getGroups(project.id)
})
