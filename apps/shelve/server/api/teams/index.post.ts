import { z, zh } from 'h3-zod'
import type { CreateTeamInput } from '@shelve/types'
import { TeamService } from '~~/server/services/teams.service'

export default eventHandler(async (event) => {
  const { user } = event.context
  const body = await zh.useValidatedBody(event, {
    name: z.string({
      required_error: 'Cannot create team without name'
    }).min(3).max(50).trim(),
    logo: z.string().optional(),
    private: z.boolean().default(false),
  })
  const input: CreateTeamInput = {
    name: body.name,
    private: body.private,
    logo: body.logo,
    requester: {
      id: user.id,
      role: user.role,
    }
  }
  return await new TeamService().createTeam(input)
})
