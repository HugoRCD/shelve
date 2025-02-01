export default eventHandler(() => {
  return useDrizzle().query.users.findMany()
})
