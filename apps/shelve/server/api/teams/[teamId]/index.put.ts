import { z } from 'zod'
import { TeamRole } from '@shelve/types'
import { TeamsService } from '~~/server/services/teams'

const updateTeamSchema = z.object({
  name: z.string().optional(),
  logo: z.string().optional(),
  slug: z.string().optional(),
})

export default eventHandler(async (event) => {
  const team = useTeam(event)
  const member = useCurrentMember(event)
  validateTeamRole(member, TeamRole.ADMIN)

  const { name, logo, slug } = await readValidatedBody(event, updateTeamSchema.parse)

  return await new TeamsService().updateTeam({
    teamId: team.id,
    name,
    logo,
    slug
  })
})
