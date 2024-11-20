export default eventHandler(async () => {
  return await db.query.users.findMany()
})
