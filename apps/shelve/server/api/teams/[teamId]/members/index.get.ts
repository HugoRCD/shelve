import { z, zh } from 'h3-zod'
import { MemberService } from '~~/server/services/member.service'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { teamId } = await zh.useValidatedParams(event, {
    teamId: z.coerce.number({
      required_error: 'Missing team ID',
    }),
  })
  const requester = {
    id: user.id,
    role: user.role,
  }
  return await new MemberService().getTeamMembersById(teamId, requester)
})
