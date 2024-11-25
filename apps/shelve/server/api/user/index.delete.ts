export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  await useDrizzle().delete(tables.users).where(eq(tables.users.id, user.id))
  return {
    statusCode: 200,
    message: 'User deleted',
  }
})
