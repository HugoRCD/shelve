import { idParamsSchema } from '~~/server/database/zod'
import { requireAdmin } from '~~/server/utils/auth'

export default eventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const { id } = await getValidatedRouterParams(event, idParamsSchema.parse)
  if (user.id === id) throw createError({ statusCode: 403, statusMessage: 'You can\'t delete your own account' })
  await db.delete(schema.users).where(eq(schema.users.id, id))
  const teams = await new TeamsService().getTeams(user.id)
  if (teams?.length) {
    for (const { id, slug } of teams) {
      await clearCache('Team', id)
      await clearCache('Team', slug)
    }
  }
  return {
    statusCode: 200,
    message: 'user deleted',
  }
})
