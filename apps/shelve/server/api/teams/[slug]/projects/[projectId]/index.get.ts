export default eventHandler(async (event) => {
  const { project } = await requireUserTeamProject(event, { projectWide: false })
  return project
})
