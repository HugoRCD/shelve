import prisma from "~/server/database/client";
import type { ProjectCreateInput } from "~/types/Project";

export async function upsertProject(project: ProjectCreateInput) {
  return prisma.project.upsert({
    where: {
      id: project.ownerId,
    },
    update: project,
    create: project,
  });
}

export async function getProjectById(id: number) {
  return prisma.project.findUnique({
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
