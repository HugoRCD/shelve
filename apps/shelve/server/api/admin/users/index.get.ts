
export default eventHandler(async (event) => {
  await requireAdmin(event)
  return db.select().from(schema.user)
})
