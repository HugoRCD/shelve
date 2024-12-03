import { z, zh } from 'h3-zod'
import { TeamsService } from '~~/server/services/teams'
import { EnvironmentsService } from '~~/server/services/environments'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { teamId } = await zh.useValidatedQuery(event, {
    teamId: z.coerce.number({
      required_error: 'Team ID is required',
    }),
  })

  return await new EnvironmentsService().getEnvironments(teamId)
})
