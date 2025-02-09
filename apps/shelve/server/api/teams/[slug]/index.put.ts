import { z } from 'zod'

const updateTeamSchema = z.object({
  name: z.string().optional(),
  logo: z.string().optional(),
  slug: z.string().optional(),
})

export default eventHandler(async (event) => {
  const team = useCurrentTeam(event)

  const { name, logo, slug } = await readValidatedBody(event, updateTeamSchema.parse)

  await clearCache('Team', team.slug)
  return await new TeamsService().updateTeam({
    teamId: team.id,
    name,
    logo,
    slug
  })
})
