import { z } from 'zod'

export default eventHandler(async (event) => {
  const { user } = await requireAppSession(event)
  const { slug } = await getValidatedQuery(event, z.object({
    slug: z.string().optional()
  }).parse)
  const teamService = new TeamsService()
  if (slug)
    return await teamService.getTeamBySlug(slug)
  return await teamService.getTeams(user.id)
})
