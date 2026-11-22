import { z } from 'zod'
import { TeamRole } from '@types'
import { idParamsSchema } from '~~/server/db/zod'

const updateMemberSchema = z.object({
  role: z.enum(TeamRole),
})

export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team, member } = await requireUserTeam(event, slug, { minRole: TeamRole.ADMIN })

  const { id } = await getValidatedRouterParams(event, idParamsSchema.parse)
  const { role } = await readValidatedBody(event, updateMemberSchema.parse)

  const target = await db.query.members.findFirst({
    where: and(eq(schema.members.id, id), eq(schema.members.teamId, team.id)),
    columns: { role: true },
  })
  if (!target) throw createError({ statusCode: 404, statusMessage: 'Member not found' })
  validateRoleAssignment(member, role, target)

  return new MembersService().updateMember({
    teamId: team.id,
    slug: team.slug,
    memberId: id,
    role
  })
})
