export default defineEventHandler(async (event) => {
  const { user } = await requireAppSession(event)
  return user
})
