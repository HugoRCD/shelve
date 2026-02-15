import { user as authUser } from '../../db/schema/better-auth.postgresql'

export default defineEventHandler(async (event) => {
  const { user } = await requireAppSession(event)

  await db.update(authUser)
    .set({
      cliInstalled: true,
    })
    .where(eq(authUser.id, user.id))

  return {
    status: 200,
    body: {
      message: 'CLI installed successfully',
    },
  }
})
