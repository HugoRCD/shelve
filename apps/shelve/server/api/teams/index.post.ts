import { z, zh } from 'h3-zod'
import { TeamService } from '~~/server/services/teams.service'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const body = await zh.useValidatedBody(event, {
    name: z.string({
      required_error: 'Cannot create team without name'
    }).min(3).max(50).trim(),
    logo: z.string().optional(),
  })
  return await new TeamService().createTeam({
    name: body.name,
    logo: body.logo,
    requester: {
      id: user.id,
      role: user.role,
    }
  })
})
