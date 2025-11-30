import { z } from 'zod'
import { TeamRole } from '@types'
import { idParamsSchema } from '~~/server/db/zod'

const updateMemberSchema = z.object({
  role: z.enum(TeamRole),
})

export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug, { minRole: TeamRole.ADMIN })

  const { id } = await getValidatedRouterParams(event, idParamsSchema.parse)
  const { role } = await readValidatedBody(event, updateMemberSchema.parse)

  return new MembersService().updateMember({
    teamId: team.id,
    slug: team.slug,
    memberId: id,
    role
  })
})
