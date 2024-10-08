export default eventHandler(async () => {
  const users = await prisma.user.findMany()
  return users.map((user) => {
    return formatUser(user)
  })
})
