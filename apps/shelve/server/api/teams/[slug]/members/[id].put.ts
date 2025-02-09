import { z } from 'zod'
import { TeamRole } from '@types'
import { idParamsSchema } from '~~/server/database/zod'

const updateMemberSchema = z.object({
  role: z.nativeEnum(TeamRole),
})

export default eventHandler(async (event) => {
  const team = useCurrentTeam(event)

  const { id } = await getValidatedRouterParams(event, idParamsSchema.parse)
  const { role } = await readValidatedBody(event, updateMemberSchema.parse)

  return new MembersService().updateMember({
    teamId: team.id,
    slug: team.slug,
    memberId: id,
    role
  })
})
