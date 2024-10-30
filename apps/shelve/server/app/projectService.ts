import type { CreateProjectInput, ProjectUpdateInput, Team } from '@shelve/types'

type CreateProjectInputWithAll = CreateProjectInput & { ownerId: number, team?: { connect: { id: number } } }

export async function createProject(project: CreateProjectInput, userId: number) {
  await deleteCachedUserProjects(userId)
  const projectAlreadyExists = await isProjectAlreadyExists(project.name, userId)
  if (projectAlreadyExists) throw new Error('Project already exists')

  const projectData = {
    ...project,
    ownerId: userId,
    users: { connect: { id: userId } }
  } as CreateProjectInputWithAll

  if (project.team) {
    projectData.team = { connect: { id: project.team.id } } as Team & { connect: { id: number } }
  }

  return prisma.project.create({ data: projectData })
}

async function isProjectAlreadyExists(name: string, userId: number): Promise<boolean> {
  const project = await prisma.project.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
      ownerId: userId,
    },
  })
  return !!project
}

export async function updateProject(project: ProjectUpdateInput, projectId: number, userId: number) {
  await deleteCachedUserProjects(userId)
  await deleteCachedProjectById(projectId)
  const findProject = await prisma.project.findFirst({
    where: {
      id: projectId,
    },
  })
  if (!findProject) throw new Error('Project not found')
  if (findProject.name !== project.name) {
    const projectAlreadyExists = await isProjectAlreadyExists(project.name, userId)
    if (projectAlreadyExists) throw new Error('Project already exists')
  }
  return prisma.project.update({
    where: {
      id: projectId,
    },
    data: project,
  })
}

export const getProjectById = cachedFunction((id: number) => {
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
  })
}, {
  maxAge: 60 * 60,
  name: 'getProjectById',
  getKey: (id: number) => `projectId:${id}`,
})

export async function addTeamToProject(projectId: number, teamId: number) {
  await deleteCachedProjectById(projectId)
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
  await deleteCachedProjectById(projectId)
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

export async function deleteProject(id: string, userId: number) {
  await deleteCachedUserProjects(userId)
  await deleteCachedProjectById(id)
  return prisma.project.delete({
    where: {
      id: parseInt(id),
      ownerId: userId,
    }
  })
}

export async function deleteCachedUserProjects(userId: number) {
  return await useStorage('cache').removeItem(`nitro:functions:getProjectsByUserId:userId:${userId}.json`)
}
export async function deleteCachedProjectById(id: number) {
  return await useStorage('cache').removeItem(`nitro:functions:getProjectById:projectId:${id}.json`)
}
