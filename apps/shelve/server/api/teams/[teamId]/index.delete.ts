import { z, zh } from 'h3-zod'
import { TeamService } from '~~/server/services/teams.service'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { teamId } = await zh.useValidatedParams(event, {
    teamId: z.coerce.number({
      required_error: 'Missing team ID',
    }),
  })
  await new TeamService().deleteTeam({
    teamId,
    requester: {
      id: user.id,
      role: user.role,
    }
  })
  return {
    statusCode: 200,
    message: 'Team deleted',
  }
})
