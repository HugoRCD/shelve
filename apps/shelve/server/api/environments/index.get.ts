import { z, zh } from 'h3-zod'
import { TeamsService } from '~~/server/services/teams'
import { EnvironmentsService } from '~~/server/services/environments'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { teamId } = await zh.useValidatedQuery(event, {
    teamId: z.coerce.number().optional(),
  })

  const resolvedTeamId = teamId || await new TeamsService().getPrivateUserTeamId(user.id)

  const environments = await new EnvironmentsService().getEnvironmentsWithVariableCounts(resolvedTeamId)

  return environments
})
