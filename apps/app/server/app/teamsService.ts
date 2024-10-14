import { type CreateTeamInput, Role, TeamRole } from '@shelve/types'
import { deleteCachedUserProjects } from '~~/server/app/projectService'

export async function createTeam(createTeamInput: CreateTeamInput, userId: number) {
  await deleteCachedTeamByUserId(userId)
  return prisma.team.create({
    data: {
      name: createTeamInput.name,
      members: {
        create: {
          role: TeamRole.OWNER,
          user: {
            connect: {
              id: userId,
            },
          },
        }
      },
    },
    include: {
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
  })
}

export async function upsertTeammate(userId: number, teammateId: number, isUpdated: boolean) {
  const updateOrCreateTeammate = (userId: number, teammateId: number) => {
    return prisma.teammate.upsert({
      where: {
        userId_teammateId: {
          userId,
          teammateId,
        },
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

export async function upsertMember(teamId: number, addMemberInput: {
  email: string;
  role: TeamRole
}, requesterId: number) {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      members: {
        some: {
          userId: requesterId,
          role: {
            in: [TeamRole.ADMIN, TeamRole.OWNER],
          }
        },
      },
    },
    include: {
      members: true,
    }
  })
  if (!team) throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  const user = await prisma.user.findFirst({
    where: {
      email: addMemberInput.email.trim(),
    },
  })
  if (!user) throw createError({ statusCode: 400, statusMessage: 'user not found' })
  await deleteCachedTeamByUserId(requesterId)
  await deleteCachedUserProjects(requesterId)
  const member = await prisma.member.upsert({
    where: {
      id: team.members.find((member) => member.userId === user.id)?.id || -1,
    },
    update: {
      role: addMemberInput.role,
    },
    create: {
      role: addMemberInput.role,
      teamId,
      userId: user.id,
    },
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
  })
  const isUpdated: boolean = new Date(member.createdAt).getTime() !== new Date(member.updatedAt).getTime()
  await upsertTeammate(requesterId, user.id, isUpdated)
  return member
}

async function isTeamMate(userId: number, requesterId: number): Promise<boolean> {
  const foundedTeamMate = await prisma.teammate.findFirst({
    where: {
      userId: {
        equals: userId,
      },
      teammateId: {
        equals: requesterId,
      },
    },
  })
  return !!foundedTeamMate
}

export async function deleteTeammate(userId: number, requesterId: number) {
  const isTeammate = await isTeamMate(userId, requesterId)
  if (!isTeammate) return
  const updatedUser = await prisma.teammate.update({
    where: {
      userId_teammateId: {
        userId: requesterId,
        teammateId: userId,
      },
    },
    data: {
      count: {
        decrement: 1,
      },
    },
    select: {
      count: true,
    },
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

export async function removeMember(teamId: number, memberId: number, requesterId: number) {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      members: {
        some: {
          userId: requesterId,
          role: {
            in: [TeamRole.ADMIN, TeamRole.OWNER],
          }
        },
      },
    },
  })
  if (!team) throw createError({ statusCode: 401, statusMessage: 'unauthorized' })

  await deleteCachedTeamByUserId(requesterId)
  await deleteCachedUserProjects(requesterId)

  const member = await prisma.member.findFirst({
    where: {
      id: memberId,
    },
    select: {
      userId: true,
    },
  })
  await deleteTeammate(member.userId, requesterId)
  await deleteTeammate(requesterId, member.userId)
  return prisma.member.delete({
    where: {
      id: memberId,
    },
  })
}

type DeleteTeamInput = {
  teamId: number
  userId: number
  userRole: Role
}

export async function deleteTeam(deleteTeamInput: DeleteTeamInput) {
  const { teamId, userId, userRole } = deleteTeamInput
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      members: {
        some: {
          userId,
          role: TeamRole.OWNER,
        },
      },
    },
  })
  if (userRole !== Role.ADMIN && !team) throw createError({ statusCode: 401, statusMessage: 'unauthorized' })
  await deleteCachedTeamByUserId(userId)
  const allMembers = await prisma.member.findMany({
    where: {
      teamId,
    },
  })
  for (const member of allMembers) {
    if (member.userId === userId) continue
    await deleteTeammate(member.userId, userId)
    await deleteTeammate(userId, member.userId)
  }
  return prisma.team.delete({
    where: {
      id: teamId,
    },
  })
}

export const getTeamByUserId = cachedFunction((userId: number) => {
  return prisma.team.findMany({
    where: {
      members: {
        some: {
          userId: userId,
        },
      }
    },
    include: {
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
  })
}, {
  maxAge: 60 * 60,
  name: 'getTeamByUserId',
  getKey: (userId: number) => `userId:${userId}`,
})

export function deleteCachedTeamByUserId(userId: number) {
  return useStorage('cache').removeItem(`nitro:functions:getTeamByUserId:userId:${userId}.json`)
}
