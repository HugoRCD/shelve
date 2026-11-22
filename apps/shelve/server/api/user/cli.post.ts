export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)

  await db.update(schema.users)
    .set({
      cliInstalled: true,
    })
    .where(eq(schema.users.id, user.id))

  return {
    status: 200,
    body: {
      message: 'CLI installed successfully',
    },
  }
})
