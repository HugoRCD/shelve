export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  await db.delete(schema.users).where(eq(schema.users.id, user.id))
  const teams = await new TeamsService().getTeams(user.id)
  if (teams?.length) {
    for (const { id, slug } of teams) {
      await clearCache('Team', id)
      await clearCache('Team', slug)
    }
  }
  return {
    statusCode: 200,
    message: 'User deleted',
  }
})
