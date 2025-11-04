export default eventHandler(() => {
  return db.query.users.findMany()
})
