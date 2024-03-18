import type { ProjectCreateInput, ProjectUpdateInput } from "@shelve/types";
import prisma from "~/server/database/client";

export async function createProject(project: ProjectCreateInput, userId: number) {
  return prisma.project.create({
    data: {
      ...project,
      ownerId: userId,
      users: {
        connect: {
          id: userId,
        }
      }
    }
  });
}

export async function updateProject(project: ProjectUpdateInput, projectId: number) {
  return prisma.project.update({
    where: {
      id: projectId,
    },
    data: project,
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
      users: {
        some: {
          id: userId,
        }
      }
    },
    orderBy: {
      updatedAt: "desc",
    },
    cacheStrategy: {
      ttl: 10,
    }
  });
}

async function removeCachedUserProjects(userId: string) {
  return await useStorage('cache').removeItem(`nitro:functions:getProjectsByUserId:userId:${userId}.json`);
}

export async function deleteProject(id: number, userId: number) {
  return prisma.project.delete({
    where: {
      id,
      ownerId: userId,
    }
  });
}
