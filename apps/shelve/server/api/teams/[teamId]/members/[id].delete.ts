import { TeamRole } from '@shelve/types'
import { MembersService } from '~~/server/services/members'

export default eventHandler(async (event) => {
  const team = useTeam(event)
  const member = useCurrentMember(event)
  validateTeamRole(member, TeamRole.ADMIN)

  await new MembersService().removeMember({
    teamId: team.id,
    memberId: member.id
  })

  return {
    statusCode: 200,
    message: 'Member removed',
  }
})
