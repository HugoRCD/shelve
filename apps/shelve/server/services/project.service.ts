import type { CreateProjectInput, Project, ProjectUpdateInput, Requester } from '@shelve/types'

export class ProjectService {

  async createProject(input: CreateProjectInput): Promise<Project> {
    await this.validateProjectName(input.name, input.teamId)

    const [createdProject] = await useDrizzle().insert(tables.projects)
      .values(input)
      .returning()
    if (!createdProject) throw new Error('Project not found after creation')
    await clearCache('Projects', input.teamId)

    return createdProject
  }

  async updateProject(input: ProjectUpdateInput): Promise<Project> {
    const existingProject = await this.getProject(input.id, input.requester.id)
    if (!existingProject) throw new Error('Project not found')

    if (existingProject.name !== input.name)
      await this.validateProjectName(input.name, existingProject.teamId, input.id)

    const [updatedProject] = await useDrizzle().update(tables.projects)
      .set(input)
      .where(eq(tables.projects.id, input.id))
      .returning()
    if (!updatedProject) throw new Error('Project not found after update')
    await clearCache('Projects', updatedProject.teamId)

    return updatedProject
  }

  getProject = withCache('Project', async (projectId: number, userId: number): Promise<Project> => {
    const project = await hasAccessToProject(projectId, userId)

    if (!project) throw new Error(`Project not found with id ${ projectId }`)
    return project
  })

  getProjects = withCache<Project[]>('Projects', async (teamId: number, requester: Requester) => {
    await validateAccess({ teamId, requester })
    return await useDrizzle().query.projects.findMany({
      where: eq(tables.projects.teamId, teamId)
    })
  })

  async deleteProject(projectId: number, userId: number): Promise<void> {
    const { teamId } = await hasAccessToProject(projectId, userId)
    await clearCache('Projects', teamId)

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

}
