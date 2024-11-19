import { z, zh } from 'h3-zod'
import { TeamService } from '~~/server/services/teams.service'

export default eventHandler(async (event) => {
  const { teamId } = await zh.useValidatedParams(event, {
    teamId: z.string({
      required_error: 'Missing teamId',
    }).transform((value) => parseInt(value)),
  })
  const { user } = event.context
  const requester = {
    id: user.id,
    role: user.role,
  }
  return await new TeamService().getTeamMembers(teamId, requester)
})
