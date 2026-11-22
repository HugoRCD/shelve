export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)

  const [updatedUser] = await db.update(schema.users)
    .set({
      cliInstalled: true,
    })
    .where(eq(schema.users.id, user.id))
    .returning()

  await setUserSession(event, {
    user: updatedUser,
    loggedInAt: new Date(),
  })

  return {
    status: 200,
    body: {
      message: 'CLI installed successfully',
    },
  }
})
