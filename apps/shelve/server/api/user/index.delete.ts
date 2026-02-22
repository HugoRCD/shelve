import { user as userTable } from '../../db/schema'


export default eventHandler(async (event) => {
  const { user } = await requireAppSession(event)
  await db.delete(userTable).where(eq(userTable.id, user.id))
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
