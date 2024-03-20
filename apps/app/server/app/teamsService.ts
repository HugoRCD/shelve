import { CreateTeamInput, TeamRole, UpdateTeamInput } from "@shelve/types";
import prisma from "~/server/database/client";

export async function createTeam(createTeamInput: CreateTeamInput, userId: number) {
  return await prisma.team.create({
    data: {
      name: createTeamInput.name,
      members: {
        create: {
          role: TeamRole.ADMIN,
          user: {
            connect: {
              id: userId,
            },
          },
        }
      },
    },
  });
}

export async function updateTeam(updateTeamInput: UpdateTeamInput, userId: number) {
  const team = await prisma.team.findFirst({
    where: {
      id: updateTeamInput.id,
      members: {
        some: {
          userId,
          role: TeamRole.ADMIN,
        },
      },
    },
  });
  if (!team) throw new Error("Unauthorized");
  return await prisma.team.update({
    where: {
      id: updateTeamInput.id,
    },
    data: {
      name: updateTeamInput.name,
      members: {
        upsert: updateTeamInput.members.map((role) => ({
          where: {
            userId: role.userId,
          },
          update: {
            role: role.role,
          },
          create: {
            role: role.role,
            user: {
              connect: {
                id: role.userId,
              },
            },
          },
        })),
      }
    },
  });
}

export async function deleteTeam(teamId: number, userId: number) {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      members: {
        some: {
          userId,
          role: TeamRole.ADMIN,
        },
      },
    },
  });
  if (!team) throw new Error("unauthorized");
  return await prisma.team.delete({
    where: {
      id: teamId,
    },
  });
}
