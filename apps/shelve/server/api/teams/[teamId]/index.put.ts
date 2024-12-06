import { z } from 'zod'
import { TeamsService } from '~~/server/services/teams'

const updateTeamSchema = z.object({
  name: z.string().optional(),
  logo: z.string().optional(),
  slug: z.string().optional(),
})

export default eventHandler(async (event) => {
  const team = useCurrentTeam(event)

  const { name, logo, slug } = await readValidatedBody(event, updateTeamSchema.parse)

  return await new TeamsService().updateTeam({
    teamId: team.id,
    name,
    logo,
    slug
  })
})
