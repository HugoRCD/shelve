export function getTeammatesByUserId(userId: number) {
  return prisma.teammate.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: 4,
    include: {
      teammate: {
        select: {
          avatar: true,
          email: true,
          username: true,
        },
      }
    }
  })
}
