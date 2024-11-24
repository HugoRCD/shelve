import type { CreateProjectInput, Project, ProjectUpdateInput } from '@shelve/types'

export class ProjectService {

  async createProject(input: CreateProjectInput): Promise<Project> {
    await this.validateProjectName(input.name, input.teamId)
    await deleteCachedTeamProjects(input.teamId)

    const [createdProject] = await useDrizzle().insert(tables.projects)
      .values(input)
      .returning()
    if (!createdProject) throw new Error('Project not found after creation')

    return createdProject
  }

  async updateProject(input: ProjectUpdateInput): Promise<Project> {
    await deleteCachedProjectById(input.id)
    await deleteCachedTeamProjects(input.teamId)

    const existingProject = await this.findProjectById(input.id)

    if (existingProject.name !== input.name)
      await this.validateProjectName(input.name, existingProject.teamId, input.id)

    const [updatedProject] = await useDrizzle().update(tables.projects)
      .set(input)
      .where(eq(tables.projects.id, input.id))
      .returning()
    if (!updatedProject) throw new Error('Project not found after update')

    return updatedProject
  }

  getProjectById = cachedFunction(async (projectId: number, userId: number): Promise<Project> => {
    const project = await this.hasAccessToProject(projectId, userId)

    if (!project) throw new Error(`Project not found with id ${projectId}`)
    return project
  }, {
    maxAge: CACHE_TTL,
    name: 'getProject',
    getKey: (projectId: number) => `projectId:${projectId}`,
  })

  getProjectsByTeamId = cachedFunction(async (teamId: number): Promise<Project[]> => {
    return await useDrizzle().query.projects.findMany({
      where: eq(tables.projects.teamId, teamId)
    })
  }, {
    maxAge: CACHE_TTL,
    name: 'getProjects',
    getKey: (teamId: number) => `teamId:${teamId}`,
  })

  async deleteProject(projectId: number, userId: number): Promise<void> {
    const { teamId } = await this.hasAccessToProject(projectId, userId)
    await deleteCachedProjectById(projectId)
    await deleteCachedTeamProjects(teamId)

    await useDrizzle().delete(tables.projects)
      .where(and(
        eq(tables.projects.id, projectId),
        eq(tables.projects.teamId, teamId)
      ))
      .returning()
  }

  private async validateProjectName(name: string, teamId: number, projectId?: number): Promise<void> {
    const exists = await this.isProjectAlreadyExists(name, teamId, projectId)
    if (exists) {
      throw createError({
        statusCode: 400,
        message: 'Project already exists in this team'
      })
    }
  }

  private async isProjectAlreadyExists(name: string, teamId: number, projectId?: number): Promise<boolean> {
    const conditions = [
      eq(tables.projects.teamId, teamId),
      ilike(tables.projects.name, name)
    ]

    if (projectId) conditions.push(not(eq(tables.projects.id, projectId)))

    const project = await useDrizzle().query.projects.findFirst({
      where: and(...conditions)
    })

    return !!project
  }

  private async findProjectById(id: number): Promise<Project> {
    const project = await useDrizzle().query.projects.findFirst({
      where: eq(tables.projects.id, id)
    })

    if (!project) {
      throw createError({
        statusCode: 404,
        message: 'Project not found'
      })
    }
    return project
  }

  private async hasAccessToProject(projectId: number, userId: number): Promise<Project> {
    const project = await useDrizzle().query.projects.findFirst({
      where: eq(tables.projects.id, projectId),
      with: {
        team: {
          with: {
            members: {
              where: eq(tables.members.userId, userId)
            }
          }
        }
      }
    })

    if (!project) throw createError({ statusCode: 401, message: 'Unauthorized' })

    return project
  }

}
