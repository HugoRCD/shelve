import { z, zh } from 'h3-zod'
import { TeamRole } from '@shelve/types'
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
  const { role } = await zh.useValidatedBody(event, {
    role: z.nativeEnum(TeamRole),
  })
  return new MembersService().updateMember({
    teamId,
    memberId,
    role,
    requester: user
  })
})
