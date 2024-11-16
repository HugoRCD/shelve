import { z, zh } from 'h3-zod'
import { type CreateTeamInput, TeamRole } from '@shelve/types'
import { TeamService } from '~~/server/services/teams.service'

export default eventHandler(async (event) => {
  const { user } = event.context
  const body = await zh.useValidatedBody(event, {
    name: z.string({
      required_error: 'Cannot create team without name'
    }).min(3).max(50).trim(),
    private: z.boolean().optional(),
  })
  const input = {
    name: body.name,
    private: body.private,
    requester: {
      id: user.id,
      role: user.role,
      teamRole: TeamRole.OWNER
    }
  } as CreateTeamInput
  return await new TeamService().createTeam(input)
})
