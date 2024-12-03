import { TeamRole } from '@shelve/types'
import { TeamsService } from '~~/server/services/teams'

export default eventHandler(async (event) => {
  const team = useTeam(event)
  const member = useCurrentMember(event)
  validateTeamRole(member, TeamRole.OWNER)

  await new TeamsService().deleteTeam({ teamId: team.id })

  return {
    statusCode: 200,
    message: 'Team deleted',
  }
})
