import type { CreateProjectInput, ProjectUpdateInput, Team, Project } from '@shelve/types'
import type { Storage, StorageValue } from 'unstorage'

export class ProjectService {

  private readonly storage: Storage<StorageValue>
  private readonly CACHE_TTL = 60 * 60 // 1 hour
  private readonly CACHE_PREFIX = {
    projects: 'nitro:functions:getProjectsByUserId:userId:',
    project: 'nitro:functions:getProjectById:projectId:'
  }

  constructor() {
    this.storage = useStorage('cache')
  }

  /**
   * Create a new project
   */
  async createProject(project: CreateProjectInput, userId: number): Promise<Project> {
    await this.deleteCachedUserProjects(userId)
    await this.validateProjectName(project.name, userId)

    const projectData = this.buildProjectData(project, userId)
    return prisma.project.create({ data: projectData })
  }

  /**
   * Update existing project
   */
  async updateProject(project: ProjectUpdateInput, projectId: number, userId: number): Promise<Project> {
    await this.deleteCachedUserProjects(userId)
    await this.deleteCachedProjectById(projectId)

    const existingProject = await this.findProjectById(projectId)

    if (existingProject.name !== project.name)
      await this.validateProjectName(project.name, userId, projectId)

    return prisma.project.update({
      where: { id: projectId },
      data: project,
    })
  }

  /**
   * Get project by ID
   */
  getProjectById(id: number): Promise<Project> {
    return cachedFunction(() => {
      return prisma.project.findUnique({
        where: { id },
        include: this.getProjectInclude()
      })
    }, {
      maxAge: this.CACHE_TTL,
      name: 'getProjectById',
      getKey: (id: number) => `projectId:${id}`,
    })(id)
  }

  /**
   * Get all projects for a user
   */
  getProjectsByUserId(userId: number): Promise<Project[]> {
    return cachedFunction(async () => {
      const [projects, teams] = await Promise.all([
        this.getUserProjects(userId),
        this.getUserTeamProjects(userId)
      ])

      const teamProjects = teams.map(team => team.projects)
      return this.removeDuplicateProjects([...projects, ...teamProjects].flat())
    }, {
      maxAge: this.CACHE_TTL,
      name: 'getProjectsByUserId',
      getKey: (userId: number) => `userId:${userId}`,
    })(userId)
  }

  /**
   * Add team to project
   */
  async addTeamToProject(projectId: number, teamId: number): Promise<Project> {
    await this.deleteCachedProjectById(projectId)
    return prisma.project.update({
      where: { id: projectId },
      data: {
        team: {
          connect: { id: teamId }
        }
      }
    })
  }

  /**
   * Remove team from project
   */
  async removeTeamFromProject(projectId: number, teamId: number): Promise<Project> {
    await this.deleteCachedProjectById(projectId)
    return prisma.project.update({
      where: { id: projectId },
      data: {
        team: {
          disconnect: { id: teamId }
        }
      }
    })
  }

  /**
   * Delete project
   */
  async deleteProject(id: string, userId: number): Promise<Project> {
    await this.deleteCachedUserProjects(userId)
    await this.deleteCachedProjectById(parseInt(id))

    return prisma.project.delete({
      where: {
        id: parseInt(id),
        ownerId: userId,
      }
    })
  }

  /**
   * Private helper methods
   */
  private async validateProjectName(name: string, userId: number, projectId?: number): Promise<void> {
    const exists = await this.isProjectAlreadyExists(name, userId, projectId)
    if (exists) {
      throw createError({
        statusCode: 400,
        message: 'Project already exists'
      })
    }
  }

  private async isProjectAlreadyExists(name: string, userId: number, projectId?: number): Promise<boolean> {
    const where: { name: { equals: string; mode: 'insensitive' }, ownerId: number } & { id?: { not: number } } = {
      name: {
        equals: name,
        mode: 'insensitive',
      },
      ownerId: userId,
    }
    if (projectId) where.id = { not: projectId }
    const project = await prisma.project.findFirst({ where })
    return !!project
  }

  private async findProjectById(id: number): Promise<Project> {
    const project = await prisma.project.findFirst({
      where: { id },
    })
    if (!project) {
      throw createError({
        statusCode: 404,
        message: 'Project not found'
      })
    }
    return project
  }

  private buildProjectData(project: CreateProjectInput, userId: number): CreateProjectInputWithAll {
    const projectData = {
      ...project,
      ownerId: userId,
      users: { connect: { id: userId } }
    } as CreateProjectInputWithAll

    if (project.team) {
      projectData.team = {
        connect: { id: project.team.id }
      } as Team & { connect: { id: number } }
    }

    return projectData
  }

  private getUserProjects(userId: number) {
    return prisma.project.findMany({
      where: { ownerId: userId },
    })
  }

  private getUserTeamProjects(userId: number) {
    return prisma.team.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
      include: {
        projects: true,
      }
    })
  }

  private removeDuplicateProjects(projects: Project[]): Project[] {
    return projects.filter((project, index, self) =>
      self.findIndex(p => p.id === project.id) === index
    )
  }

  private getProjectInclude() {
    return {
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
  }

  async deleteCachedUserProjects(userId: number): Promise<void> {
    await this.storage.removeItem(`${this.CACHE_PREFIX.projects}${userId}.json`)
  }

  private async deleteCachedProjectById(id: number): Promise<void> {
    await this.storage.removeItem(`${this.CACHE_PREFIX.project}${id}.json`)
  }

}
