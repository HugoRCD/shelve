export default eventHandler(async (event) => {
  await requireAdmin(event)
  return db.query.users.findMany({ columns: PUBLIC_USER_COLUMNS })
})
