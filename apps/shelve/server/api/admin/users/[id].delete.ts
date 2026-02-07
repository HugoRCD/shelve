import { userIdParamsSchema } from '~~/server/db/zod'

export default eventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const { id } = await getValidatedRouterParams(event, userIdParamsSchema.parse)
  if (user.id === id) throw createError({ statusCode: 403, statusMessage: 'You can\'t delete your own account' })
  await db.delete(schema.user).where(eq(schema.user.id, id))
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
