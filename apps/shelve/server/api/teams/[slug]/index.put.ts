import { z } from 'zod'
import { TeamRole } from '@types'
import { getTeamSlugFromEvent, requireUserTeam } from '~~/server/utils/auth'

const updateTeamSchema = z.object({
  name: z.string().optional(),
  logo: z.string().optional(),
  slug: z.string().optional(),
})

export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug, { minRole: TeamRole.ADMIN })

  const { name, logo, slug: newSlug } = await readValidatedBody(event, updateTeamSchema.parse)

  await clearCache('Team', team.slug)
  return await new TeamsService().updateTeam({
    teamId: team.id,
    name,
    logo,
    slug: newSlug
  })
})
