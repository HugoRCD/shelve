import { z, zh } from 'h3-zod'
import { TeamRole } from '@shelve/types'
import { MemberService } from '~~/server/services/member.service'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { teamId } = await zh.useValidatedParams(event, {
    teamId: z.coerce.number({
      required_error: 'Missing team ID',
    }),
  })
  const body = await zh.useValidatedBody(event, {
    email: z.string({
      required_error: 'Missing new member email',
    }).email().trim(),
    role: z.nativeEnum(TeamRole).default(TeamRole.MEMBER)
  })
  return await new MemberService().addMember({
    teamId,
    email: body.email,
    role: body.role,
    requester: {
      id: user.id,
      role: user.role,
    },
  })
})
