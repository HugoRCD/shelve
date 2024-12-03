import { z } from 'zod'
import { TeamRole } from '@shelve/types'
import { MembersService } from '~~/server/services/members'

const createMemberSchema = z.object({
  email: z.string({
    required_error: 'Missing new member email',
  }).email().trim(),
  role: z.nativeEnum(TeamRole).default(TeamRole.MEMBER)
})

export default eventHandler(async (event) => {
  const team = useTeam(event)
  const member = useCurrentMember(event)
  validateTeamRole(member, TeamRole.ADMIN)

  const { email, role } = await readValidatedBody(event, createMemberSchema.parse)

  return await new MembersService().addMember({
    teamId: team.id,
    email,
    role
  })
})
