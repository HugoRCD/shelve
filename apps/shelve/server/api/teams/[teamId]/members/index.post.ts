import { z, zh } from 'h3-zod'
import { type AddMemberInput, TeamRole } from '@shelve/types'
import { TeamService } from '~~/server/services/teams.service'

export default eventHandler(async (event) => {
  const { user } = event.context
  const params = await zh.useValidatedParams(event, {
    teamId: z.number({
      required_error: 'Missing teamId',
    }),
  })
  const body = await zh.useValidatedBody(event, {
    email: z.string({
      required_error: 'Missing new member email',
    }).email().trim(),
    role: z.nativeEnum(TeamRole).default(TeamRole.MEMBER).optional()
  })
  const input = {
    teamId: params.teamId,
    email: body.email,
    role: body.role,
    requester: {
      id: user.id,
      role: user.role,
    },
  } as AddMemberInput
  return await new TeamService().addMember(input)
})
