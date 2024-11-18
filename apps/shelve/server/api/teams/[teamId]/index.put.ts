import { z, zh } from 'h3-zod'
import type { UpdateTeamInput } from '@shelve/types'
import { TeamService } from '~~/server/services/teams.service'

export default eventHandler(async (event) => {
  const params = await zh.useValidatedParams(event, {
    teamId: z.number({
      required_error: 'Missing teamId',
    }),
  })
  const body = await zh.useValidatedBody(event, {
    name: z.string().optional(),
    logo: z.string().optional(),
  })
  const { user } = event.context
  const input: UpdateTeamInput = {
    id: params.teamId,
    name: body.name,
    logo: body.logo,
    requester: {
      id: user.id,
      role: user.role,
    }
  }
  await new TeamService().updateTeam(input)
  return {
    statusCode: 200,
    message: 'Team deleted',
  }
})
