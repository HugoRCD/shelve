import { type CreateTeamInput, TeamRole } from '@shelve/types'
import prisma from '~~/server/database/client'

export function createTeam(createTeamInput: CreateTeamInput, userId: number) {
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
  return prisma.member.upsert({
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
  return prisma.team.delete({
    where: {
      id: teamId,
    },
  })
}
