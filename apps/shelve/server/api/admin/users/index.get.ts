export default eventHandler(async () => {
  return await useDrizzle().query.users.findMany()
})
