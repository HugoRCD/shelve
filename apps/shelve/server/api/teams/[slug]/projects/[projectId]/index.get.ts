export default eventHandler(async (event) => {
  const { project } = await requireUserTeamProject(event)
  return project
})
