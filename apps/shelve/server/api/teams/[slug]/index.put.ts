import { z } from 'zod'
import { TeamRole } from '@types'

const updateTeamSchema = z.object({
  name: z.string().min(3).max(50).trim().optional(),
  logo: z.string().optional(),
  slug: z.string().max(50).optional(),
})

export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug, { minRole: TeamRole.ADMIN })

  const { name, logo, slug: newSlug } = await readValidatedBody(event, updateTeamSchema.parse)

  await clearCache('Team', team.slug)
  const updatedTeam = await new TeamsService().updateTeam({
    teamId: team.id,
    name,
    logo,
    slug: newSlug
  })

  await logAudit(event, {
    teamId: team.id,
    action: 'team.update',
    resourceType: 'team',
    resourceId: team.id,
    metadata: {
      name: updatedTeam.name !== team.name ? updatedTeam.name : undefined,
      slug: updatedTeam.slug !== team.slug ? updatedTeam.slug : undefined,
      previousSlug: updatedTeam.slug !== team.slug ? team.slug : undefined,
    },
  })

  return updatedTeam
})
