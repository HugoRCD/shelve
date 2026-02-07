export default eventHandler(async (event) => {
  await requireAdmin(event)
  return db.query.user.findMany()
})
