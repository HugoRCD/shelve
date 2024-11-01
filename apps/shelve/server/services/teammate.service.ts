export class TeammateService {

  private readonly DEFAULT_LIMIT = 4

  /**
   * Get recent teammates for a user
   */
  getTeammatesByUserId(userId: number, limit: number = this.DEFAULT_LIMIT) {
    return prisma.teammate.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
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

}
