import { z } from 'zod'
import { TeamRole } from '@shelve/types'
import { MembersService } from '~~/server/services/members'

const updateMemberSchema = z.object({
  role: z.nativeEnum(TeamRole),
})

export default eventHandler(async (event) => {
  const team = useTeam(event)
  const member = useCurrentMember(event)
  validateTeamRole(member, TeamRole.ADMIN)

  const { role } = await readValidatedBody(event, updateMemberSchema.parse)

  return new MembersService().updateMember({
    teamId: team.id,
    memberId: member.id,
    role
  })
})
