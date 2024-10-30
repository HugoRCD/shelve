export default eventHandler(async () => {
  const users = await prisma.user.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
  })
  return users.map((user) => {
    return formatUser(user)
  })
})
