export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug, { teamWide: false })
  const projects = await new ProjectsService().getProjects(team.id)
  const projectIds = await getTokenScopeIds(event, 'projectIds')
  return projectIds ? projects?.filter(project => projectIds.includes(project.id)) : projects
})
