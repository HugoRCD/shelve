import { TeamRole } from '@types'
import { idParamsSchema } from '~~/server/database/zod'
import { getTeamSlugFromEvent, requireUserTeam } from '~~/server/utils/auth'

export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug, { minRole: TeamRole.OWNER })

  const { id } = await getValidatedRouterParams(event, idParamsSchema.parse)

  await new MembersService().removeMember({
    teamId: team.id,
    slug: team.slug,
    memberId: id,
  })

  return {
    statusCode: 200,
    message: 'Member removed',
  }
})
