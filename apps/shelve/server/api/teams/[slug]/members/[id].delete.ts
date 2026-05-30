import { TeamRole } from '@types'
import { idParamsSchema } from '~~/server/db/zod'

export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug, { minRole: TeamRole.OWNER })

  const { id } = await getValidatedRouterParams(event, idParamsSchema.parse)

  const member = await db.query.members.findFirst({
    where: and(eq(schema.members.id, id), eq(schema.members.teamId, team.id)),
    with: { user: true },
  })
  if (!member) throw createError({ statusCode: 404, statusMessage: 'Member not found' })

  await new MembersService().removeMember({
    teamId: team.id,
    slug: team.slug,
    memberId: id,
  })

  await logAudit(event, {
    teamId: team.id,
    action: 'team.member.remove',
    resourceType: 'user',
    resourceId: member.userId,
    metadata: {
      email: member.user.email,
      username: member.user.username,
    },
  })

  return {
    statusCode: 200,
    message: 'Member removed',
  }
})
