import { z } from 'zod'
import { TeamRole } from '@types'

const createMemberSchema = z.object({
  email: z.string({
    error: 'Missing new member email',
  }).email().trim(),
  role: z.enum(TeamRole).default(TeamRole.MEMBER)
})

export default eventHandler(async (event) => {
  const team = useCurrentTeam(event)
  const member = useCurrentMember(event)
  validateTeamRole(member, TeamRole.ADMIN)

  const { email, role } = await readValidatedBody(event, createMemberSchema.parse)

  return await new MembersService().addMember({
    teamId: team.id,
    slug: team.slug, // use for caching
    email,
    role
  })
})
