export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug, { teamWide: false })

  const environments = await new EnvironmentsService().getEnvironments(team.id)
  const environmentIds = await getTokenScopeIds(event, 'environmentIds')
  return environmentIds ? environments?.filter(environment => environmentIds.includes(environment.id)) : environments
})
