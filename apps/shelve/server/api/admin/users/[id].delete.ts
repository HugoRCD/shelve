import { userIdParamsSchema } from '~~/server/db/zod'
import { user as authUser } from '../../../db/schema/better-auth.postgresql'

export default eventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const { id } = await getValidatedRouterParams(event, userIdParamsSchema.parse)
  if (user.id === id) throw createError({ statusCode: 403, statusMessage: 'You can\'t delete your own account' })
  await db.delete(authUser).where(eq(authUser.id, id))
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
