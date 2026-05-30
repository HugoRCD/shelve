import { TeamRole } from '@types'
import { idParamsSchema } from '~~/server/db/zod'

export default defineEventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug, { minRole: TeamRole.OWNER })

  const { id } = await getValidatedRouterParams(event, idParamsSchema.parse)

  const environment = await db.query.environments.findFirst({
    where: and(eq(schema.environments.id, id), eq(schema.environments.teamId, team.id)),
  })
  if (!environment) throw createError({ statusCode: 404, statusMessage: 'Environment not found' })

  await db.delete(schema.environments)
    .where(eq(schema.environments.id, id))

  await clearCache('Environments', team.id)

  void logAudit(event, {
    teamId: team.id,
    action: 'environment.delete',
    resourceType: 'environment',
    resourceId: id,
    metadata: { name: environment.name },
  })

  return {
    statusCode: 204,
    message: 'Environment deleted',
  }
})
