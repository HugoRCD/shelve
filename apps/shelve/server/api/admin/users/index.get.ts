export default eventHandler(() => {
  return prisma.user.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
  })
})
