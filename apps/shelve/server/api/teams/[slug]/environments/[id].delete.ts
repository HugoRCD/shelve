import { TeamRole } from '@types'
import { idParamsSchema } from '~~/server/database/zod'
import { getTeamSlugFromEvent, requireUserTeam } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug, { minRole: TeamRole.OWNER })

  const { id } = await getValidatedRouterParams(event, idParamsSchema.parse)

  await db.delete(schema.environments)
    .where(eq(schema.environments.id, id))

  await clearCache('Environments', team.id)

  return {
    statusCode: 204,
    message: 'Environment deleted',
  }
})
