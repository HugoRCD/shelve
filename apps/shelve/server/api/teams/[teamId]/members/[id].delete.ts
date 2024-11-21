import { z, zh } from 'h3-zod'
import { MemberService } from '~~/server/services/member.service'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { teamId, memberId } = await zh.useValidatedParams(event, {
    teamId: z.coerce.number({
      required_error: 'Missing team ID',
    }),
    memberId: z.coerce.number({
      required_error: 'Missing member ID',
    })
  })
  await new MemberService().removeMember({
    teamId,
    memberId,
    requester: {
      id: user.id,
      role: user.role,
    },
  })
  return {
    statusCode: 200,
    message: 'Member removed',
  }
})
