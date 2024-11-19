import { z, zh } from 'h3-zod'
import { MemberService } from '~~/server/services/member.service'

export default eventHandler(async (event) => {
  const { teamId } = await zh.useValidatedParams(event, {
    teamId: z.string({
      required_error: 'Missing teamId',
    }).transform((value) => parseInt(value)),
  })
  const { user } = event.context
  const requester = {
    id: user.id,
    role: user.role,
  }
  return await new MemberService().getTeamMembersById(teamId, requester)
})
