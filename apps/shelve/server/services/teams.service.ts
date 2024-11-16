import type { CreateTeamInput, DeleteTeamInput, Member, Team } from '@shelve/types'
import { TeamRole } from '@shelve/types'
import type { Storage, StorageValue } from 'unstorage'
// import { ProjectService } from '~~/server/services/project.service'
// import { users } from '~~/server/database'

export class TeamService {

  private readonly storage: Storage<StorageValue>
  private readonly CACHE_TTL = 60 * 60 // 1 hour
  private readonly CACHE_PREFIX = 'nitro:functions:getTeamByUserId:userId:'

  constructor() {
    this.storage = useStorage('cache')
  }

  async createTeam(input: CreateTeamInput): Promise<Team> {
    return await db.transaction(async (tx) => {
      const [team] = await tx.insert(tables.teams)
        .values({
          name: input.name,
          private: input.private,
        })
        .returning()

      await tx.insert(tables.members)
        .values({
          userId: input.requester.id,
          teamId: team.id,
          role: TeamRole.OWNER
        })

      const createdTeam = await tx.query.teams.findFirst({
        where: eq(tables.teams.id, team.id),
        with: {
          members: {
            with: {
              user: true
            }
          }
        }
      })
      if (!createdTeam) throw new Error(`Team not found after creation with id ${team.id}`)
      return createdTeam
    })
  }

  /*async removeMember(teamId: number, memberId: number, requesterId: number): Promise<Member> {
    const projectService = new ProjectService()
    await this.validateTeamAccess(teamId, requesterId)
    await this.deleteCachedTeamByUserId(requesterId)
    await projectService.deleteCachedUserProjects(requesterId)

    const member = await this.getMemberById(memberId)
    if (!member) throw createError({ statusCode: 404, statusMessage: 'Member not found' })
    await this.deleteTeammate(member.userId, requesterId)
    await this.deleteTeammate(requesterId, member.userId)

    return prisma.member.delete({
      where: { id: memberId },
    })
  }

  async deleteTeam(deleteTeamInput: DeleteTeamInput): Promise<Team> {
    const { teamId, userId, userRole } = deleteTeamInput
    const team = await this.validateTeamOwnership(teamId, userId)

    if (userRole !== Role.ADMIN && !team) {
      throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
    }

    await this.deleteCachedTeamByUserId(userId)
    await this.cleanupTeammates(teamId, userId)

    return prisma.team.delete({
      where: { id: teamId },
    })
  }

  getTeamsByUserId = cachedFunction((userId): Promise<Team[]> => {
    return prisma.team.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
      include: this.getTeamInclude()
    })
  }, {
    maxAge: this.CACHE_TTL,
    name: 'getTeamByUserId',
    getKey: (userId: number) => `userId:${userId}`,
  })

  private async upsertTeammate(userId: number, teammateId: number, isUpdated: boolean): Promise<void> {
    const updateOrCreateTeammate = (userId: number, teammateId: number) => {
      return prisma.teammate.upsert({
        where: {
          userId_teammateId: { userId, teammateId },
        },
        update: {
          updatedAt: new Date(),
          count: {
            increment: isUpdated ? 0 : 1,
          },
        },
        create: {
          userId,
          teammateId,
        },
      })
    }

    await Promise.all([
      updateOrCreateTeammate(userId, teammateId),
      updateOrCreateTeammate(teammateId, userId),
    ])
  }

  private async deleteTeammate(userId: number, requesterId: number): Promise<void> {
    if (!await this.isTeamMate(userId, requesterId)) return

    const updatedUser = await prisma.teammate.update({
      where: {
        userId_teammateId: {
          userId: requesterId,
          teammateId: userId,
        },
      },
      data: {
        count: { decrement: 1 },
      },
      select: { count: true },
    })

    if (updatedUser.count === 0) {
      await prisma.teammate.delete({
        where: {
          userId_teammateId: {
            userId: requesterId,
            teammateId: userId,
          },
        },
      })
    }
  }

  private async isTeamMate(userId: number, requesterId: number): Promise<boolean> {
    const foundedTeamMate = await prisma.teammate.findFirst({
      where: {
        userId: { equals: userId },
        teammateId: { equals: requesterId },
      },
    })
    return !!foundedTeamMate
  }

  private async validateTeamAccess(teamId: number, requesterId: number): Promise<Team> {
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        members: {
          some: {
            userId: requesterId,
            role: { in: [TeamRole.ADMIN, TeamRole.OWNER] },
          }
        },
      },
      include: { members: true },
    })
    if (!team) throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
    return team
  }

  private validateTeamOwnership(teamId: number, userId: number): Promise<Team> {
    return prisma.team.findFirst({
      where: {
        id: teamId,
        members: {
          some: {
            userId,
            role: TeamRole.OWNER,
          }
        },
      },
    })
  }

  private async findUserByEmail(email: string) {
    const user = await prisma.user.findFirst({
      where: { email: email.trim() },
    })
    if (!user) throw createError({ statusCode: 400, statusMessage: 'user not found' })
    return user
  }

  private getMemberById(memberId: number) {
    return prisma.member.findFirst({
      where: { id: memberId },
      select: { userId: true },
    })
  }

  private async cleanupTeammates(teamId: number, userId: number): Promise<void> {
    const allMembers = await prisma.member.findMany({
      where: { teamId },
    })

    for (const member of allMembers) {
      if (member.userId === userId) continue
      await this.deleteTeammate(member.userId, userId)
      await this.deleteTeammate(userId, member.userId)
    }
  }

  private deleteCachedTeamByUserId(userId: number): Promise<void> {
    return this.storage.removeItem(`${this.CACHE_PREFIX}${userId}.json`)
  }

  private getTeamInclude() {
    return {
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: true,
            }
          }
        }
      }
    }
  }*/

}

