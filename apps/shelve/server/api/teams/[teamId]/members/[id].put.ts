import { z } from 'zod'
import { TeamRole } from '@shelve/types'
import { MembersService } from '~~/server/services/members'
import { idParamsSchema } from '~~/server/database/zod'

const updateMemberSchema = z.object({
  role: z.nativeEnum(TeamRole),
})

export default eventHandler(async (event) => {
  const team = useTeam(event)

  const { id } = await getValidatedRouterParams(event, idParamsSchema.parse)
  const { role } = await readValidatedBody(event, updateMemberSchema.parse)

  return new MembersService().updateMember({
    teamId: team.id,
    memberId: id,
    role
  })
})
