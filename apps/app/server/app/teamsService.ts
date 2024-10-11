import { type CreateTeamInput, TeamRole } from '@shelve/types'

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

export async function upsertTeammate(userId: number, teammateId: number) {
  const teammate = await prisma.teammate.upsert({
    where: {
      userId_teammateId: {
        userId,
        teammateId,
      },
    },
    update: {
      updatedAt: new Date(),
      count: {
        increment: 1,
      }
    },
    create: {
      userId,
      teammateId,
    },
  })

  const teammate2 = await prisma.teammate.upsert({
    where: {
      userId_teammateId: {
        userId: teammateId,
        teammateId: userId,
      },
    },
    update: {
      updatedAt: new Date(),
      count: {
        increment: 1,
      }
    },
    create: {
      userId: teammateId,
      teammateId: userId,
    },
  })

  return [teammate, teammate2]
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
  if (!team) throw new Error('unauthorized')
  const user = await prisma.user.findFirst({
    where: {
      email: addMemberInput.email,
    },
  })
  if (!user) throw new Error('user not found')
  await deleteCachedTeamByUserId(requesterId)
  const teams = await prisma.member.upsert({
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

  upsertTeammate(requesterId, user.id)

  return teams
}

export async function deleteTeammate(userId: number, teammateId: number) {
  if (userId === teammateId) {
    return
  }
  const teammate = await prisma.teammate.update({
    where: {
      userId_teammateId: {
        userId: userId,
        teammateId: teammateId,
      },
    },
    data: {
      count: {
        decrement: 1,
      }
    },
  })

  const teammate2 = await prisma.teammate.update({
    where: {
      userId_teammateId: {
        userId: teammateId,
        teammateId: userId,
      },
    },
    data: {
      count: {
        decrement: 1,
      }
    },
  })

  if (teammate.count === 0) {
    await prisma.teammate.delete({
      where: {
        userId_teammateId: {
          userId,
          teammateId,
        },
      },
    })
  }

  if (teammate2.count === 0) {
    await prisma.teammate.delete({
      where: {
        userId_teammateId: {
          userId: teammateId,
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
  if (!team) throw new Error('unauthorized')

  await deleteCachedTeamByUserId(requesterId)
  await deleteTeammate(requesterId, memberId)
  return prisma.member.delete({
    where: {
      id: memberId,
    },
  })
}

export async function deleteTeam(teamId: number, userId: number) {
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
  if (!team) throw new Error('unauthorized')
  await deleteCachedTeamByUserId(userId)
  // call deleteteammate for all members
  const allMembers = await prisma.member.findMany({
    where: {
      teamId,
    },
  })
  console.log('allMembers', allMembers)
  for (const member of allMembers) {
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
