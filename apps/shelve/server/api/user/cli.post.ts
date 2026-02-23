import { user as userTable } from '../../db/schema'


export default defineEventHandler(async (event) => {
  const { user } = await requireAppSession(event)

  await db.update(userTable)
    .set({
      cliInstalled: true,
    })
    .where(eq(userTable.id, user.id))

  return {
    status: 200,
    body: {
      message: 'CLI installed successfully',
    },
  }
})
