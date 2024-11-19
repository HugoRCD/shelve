import { z, zh } from 'h3-zod'
import type { UpdateMemberInput } from '@shelve/types'
import { TeamRole } from '@shelve/types'
import { TeamService } from '~~/server/services/teams.service'

export default eventHandler(async (event) => {
  const params = await zh.useValidatedParams(event, {
    teamId: z.string({
      required_error: 'Missing teamId',
    }).transform((value) => parseInt(value)),
    id: z.string({
      required_error: 'Missing memberId',
    }).transform((value) => parseInt(value)),
  })
  const body = await zh.useValidatedBody(event, {
    role: z.nativeEnum(TeamRole),
  })
  const { user } = event.context
  const input: UpdateMemberInput = {
    teamId: params.teamId,
    memberId: params.id,
    role: body.role,
    requester: {
      id: user.id,
      role: user.role,
    },
  }
  return new TeamService().updateMember(input)
})
