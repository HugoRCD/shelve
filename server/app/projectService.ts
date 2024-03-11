import type { ProjectCreateInput } from "~/types/Project";
import prisma from "~/server/database/client";

export async function upsertProject(project: ProjectCreateInput) {
  return prisma.project.upsert({
    where: {
      id: project.id,
    },
    create: project,
    update: project,
  });
}

export async function getProjectById(id: number) {
  return prisma.project.findUnique({
    include: {
      variables: true,
      owner: {
        select: {
          id: true,
          email: true,
          username: true,
        },
      }
    },
    where: {
      id,
    },
  });
}

export async function getProjectsByUserId(userId: number) {
  return prisma.project.findMany({
    where: {
      ownerId: userId,
    },
  });
}

export async function deleteProject(id: number) {
  return prisma.project.delete({
    where: {
      id,
    },
  });
}
