import { z, zh } from 'h3-zod'
import { TeamsService } from '~~/server/services/teams'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { teamId } = await zh.useValidatedParams(event, {
    teamId: z.coerce.number({
      required_error: 'Missing team ID',
    }),
  })
  await new TeamsService().deleteTeam({
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
