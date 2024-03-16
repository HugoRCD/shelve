import type { ProjectCreateInput } from "@shelve/types";
import prisma from "~/server/database/client";

export async function upsertProject(project: ProjectCreateInput) {
  await removeCachedUserProjects(project.ownerId.toString());
  return prisma.project.upsert({
    where: {
      id: project.id || -1,
    },
    create: project,
    update: project,
  });
}

export async function getProjectById(id: number) {
  return prisma.project.findUnique({
    include: {
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

export const getProjectsByUserId = cachedFunction(async (userId: number) => {
  return prisma.project.findMany({
    where: {
      ownerId: userId,
    },
    orderBy: {
      updatedAt: "desc",
    }
  });
}, {
  maxAge: 20,
    name: "getProjectsByUserId",
    getKey: (userId: number) => `userId:${userId}`,
})

async function removeCachedUserProjects(userId: string) {
  return await useStorage('cache').removeItem(`nitro:functions:getProjectsByUserId:userId:${userId}.json`);
}

export async function deleteProject(id: number) {
  return prisma.project.delete({
    where: {
      id,
    },
  });
}
