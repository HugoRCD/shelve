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
    include: {
      team: {
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
      }
    }
  });
}

export async function addTeamToProject(projectId: number, teamId: number) {
  return prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      team: {
        connect: {
          id: teamId,
        }
      }
    }
  });
}

export async function removeTeamFromProject(projectId: number, teamId: number) {
  return prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      team: {
        disconnect: {
          id: teamId,
        }
      }
    }
  });
}

export async function getProjectsByUserId(userId: number) {
  const [projects, teams] = await Promise.all([
    prisma.project.findMany({
      where: {
        ownerId: userId,
      },
      cacheStrategy: {
        ttl: 60,
      }
    }),
    prisma.team.findMany({
      where: {
        members: {
          some: {
            userId,
          }
        }
      },
      include: {
        projects: true,
      },
      cacheStrategy: {
        ttl: 60,
      }
    })
  ]);
  const teamProjects = teams.map(team => team.projects);
  return [...projects, ...teamProjects].flat().filter((project, index, self) => self.findIndex(p => p.id === project.id) === index);
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
