import type { CreateProjectInput, ProjectUpdateInput } from '@shelve/types'
import prisma from '~/server/database/client'

export async function createProject(project: CreateProjectInput, userId: number) {
  await removeCachedUserProjects(userId.toString())
  const projectAlreadyExists = await isProjectAlreadyExists(project.name, userId)
  if (projectAlreadyExists) throw new Error('Project already exists')
  if (project.team) {
    return prisma.project.create({
      data: {
        ...project,
        ownerId: userId,
        users: {
          connect: {
            id: userId,
          }
        },
        team: {
          connect: {
            id: project.team.id,
          }
        }
      }
    })
  }
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
  })

}

export async function updateProject(project: ProjectUpdateInput, projectId: number, userId: number) {
  await removeCachedUserProjects(userId.toString())
  await removeCachedProjectById(projectId.toString())
  return prisma.project.update({
    where: {
      id: projectId,
    },
    data: project,
  })
}

export const getProjectById = cachedFunction(async (id: number) => {
  return await prisma.project.findUnique({
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
  })
}, {
  maxAge: 60 * 60,
  name: 'getProjectById',
  getKey: (id: number) => `projectId:${id}`,
})

export async function addTeamToProject(projectId: number, teamId: number) {
  await removeCachedProjectById(projectId.toString())
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
  })
}

export async function removeTeamFromProject(projectId: number, teamId: number) {
  await removeCachedProjectById(projectId.toString())
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
  })
}
export const getProjectsByUserId = cachedFunction(async (userId: number) => {
  const [projects, teams] = await Promise.all([
    prisma.project.findMany({
      where: {
        ownerId: userId,
      },
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
      }
    })
  ])
  const teamProjects = teams.map(team => team.projects)
  return [...projects, ...teamProjects].flat().filter((project, index, self) => self.findIndex(p => p.id === project.id) === index)
}, {
  maxAge: 60 * 60,
  name: 'getProjectsByUserId',
  getKey: (userId: number) => `userId:${userId}`,
})

async function isProjectAlreadyExists(name: string, userId: number) {
  const project = await prisma.project.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
      ownerId: userId,
    }
  })
  return !!project
}

async function removeCachedUserProjects(userId: string) {
  return await useStorage('cache').removeItem(`nitro:functions:getProjectsByUserId:userId:${userId}.json`)
}
async function removeCachedProjectById(id: string) {
  return await useStorage('cache').removeItem(`nitro:functions:getProjectById:projectId:${id}.json`)
}

export async function deleteProject(id: string, userId: number) {
  await removeCachedUserProjects(userId.toString())
  await removeCachedProjectById(id)
  return prisma.project.delete({
    where: {
      id: parseInt(id),
      ownerId: userId,
    }
  })
}
