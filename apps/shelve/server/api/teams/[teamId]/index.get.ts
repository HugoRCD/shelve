import { TeamRole } from '@shelve/types'
import { TeamsService } from '~~/server/services/teams'

export default eventHandler(async (event) => {
  const team = useCurrentTeam(event)
  const member = useCurrentMember(event)
  validateTeamRole(member, TeamRole.ADMIN)
  return await new TeamsService().getTeam(team.id)
})
