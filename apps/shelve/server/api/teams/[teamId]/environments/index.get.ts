import { z, zh } from 'h3-zod'
import { EnvironmentsService } from '~~/server/services/environments'

export default eventHandler(async (event) => {
  await requireUserSession(event)
  const { teamId } = await zh.useValidatedParams(event, {
    teamId: z.coerce.number({
      required_error: 'Team ID is required',
    }),
  })

  return await new EnvironmentsService().getEnvironments(teamId)
})
