import { z } from 'zod'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { slug } = await getValidatedQuery(event, z.object({
    slug: z.string().optional()
  }).parse)
  if (slug) {
    const { team } = await requireUserTeam(event, slug, { teamWide: false })
    return team
  }
  const teams = await new TeamsService().getTeams(user.id)
  const teamIds = await getTokenScopeIds(event, 'teamIds')
  return teamIds ? teams?.filter(team => teamIds.includes(team.id)) : teams
})
