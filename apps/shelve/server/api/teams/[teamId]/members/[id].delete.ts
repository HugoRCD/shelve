import { z, zh } from 'h3-zod'
import type { RemoveMemberInput } from '@shelve/types'
import { TeamService } from '~~/server/services/teams.service'

export default eventHandler(async (event) => {
  const { user } = event.context
  const params = await zh.useValidatedParams(event, {
    teamId: z.number({
      required_error: 'Missing teamId',
    }),
    id: z.number({
      required_error: 'Missing memberId',
    }),
  })
  const input = {
    teamId: params.teamId,
    memberId: params.id,
    requester: {
      id: user.id,
      role: user.role,
    },
  } as RemoveMemberInput
  await new TeamService().removeMember(input)
  return {
    statusCode: 200,
    message: 'Member removed',
  }
})
