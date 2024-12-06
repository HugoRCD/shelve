import { z } from 'zod'
import { TeamsService } from '~~/server/services/teams'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { slug } = await getValidatedQuery(event, z.object({
    slug: z.string().optional()
  }).parse)
  const teamService = new TeamsService()
  if (slug)
    return await teamService.getTeamBySlug(slug)
  return await teamService.getTeams(user.id)
})
