export default defineEventHandler(async (event) => {
  const { user } = await requireAppSession(event)

  await db.update(schema.user)
    .set({
      cliInstalled: true,
    })
    .where(eq(schema.user.id, user.id))

  return {
    status: 200,
    body: {
      message: 'CLI installed successfully',
    },
  }
})
