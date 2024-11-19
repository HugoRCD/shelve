import { z, zh } from 'h3-zod'
import type { RemoveMemberInput } from '@shelve/types'
import { MemberService } from '~~/server/services/member.service'

export default eventHandler(async (event) => {
  const params = await zh.useValidatedParams(event, {
    teamId: z.number({
      required_error: 'Missing teamId',
    }),
    id: z.number({
      required_error: 'Missing memberId',
    }),
  })
  const { user } = event.context
  const input: RemoveMemberInput = {
    teamId: params.teamId,
    memberId: params.id,
    requester: {
      id: user.id,
      role: user.role,
    },
  }
  await new MemberService().removeMember(input)
  return {
    statusCode: 200,
    message: 'Member removed',
  }
})
