import { z, zh } from 'h3-zod'
import type { DeleteTeamInput } from '@shelve/types'
import { TeamService } from '~~/server/services/teams.service'

export default eventHandler(async (event) => {
  const { user } = event.context
  const params = await zh.useValidatedParams(event, {
    teamId: z.string({
      required_error: 'Missing teamId',
    }).transform((value) => parseInt(value)),
  })
  const input = {
    teamId: params.teamId,
    requester: {
      id: user.id,
      role: user.role,
    }
  } as DeleteTeamInput
  await new TeamService().deleteTeam(input)
  return {
    statusCode: 200,
    message: 'Team deleted',
  }
})
