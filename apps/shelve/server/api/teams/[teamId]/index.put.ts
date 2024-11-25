import { z, zh } from 'h3-zod'
import { TeamsService } from '~~/server/services/teams'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { teamId } = await zh.useValidatedParams(event, {
    teamId: z.coerce.number({
      required_error: 'Missing team ID',
    }),
  })
  const { name, logo } = await zh.useValidatedBody(event, {
    name: z.string().optional(),
    logo: z.string().optional(),
  })
  return await new TeamsService().updateTeam({
    teamId,
    name,
    logo,
    requester: user
  })
})
