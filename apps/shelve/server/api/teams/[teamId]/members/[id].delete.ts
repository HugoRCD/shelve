import { z, zh } from 'h3-zod'
import { MembersService } from '~~/server/services/members'

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
  await new MembersService().removeMember({
    teamId,
    memberId,
    requester: user
  })
  return {
    statusCode: 200,
    message: 'Member removed',
  }
})
