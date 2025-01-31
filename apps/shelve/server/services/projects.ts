import type { CreateProjectInput, Project, ProjectUpdateInput } from '@types'

export class ProjectsService {

  async createProject(input: CreateProjectInput): Promise<Project> {
    await this.validateProjectName(input.name, input.teamId)

    const [createdProject] = await useDrizzle().insert(tables.projects)
      .values(input)
      .returning()
    if (!createdProject) throw createError({ statusCode: 422, message: 'Failed to create project' })
    await clearCache('Projects', input.teamId)

    return createdProject
  }

  async updateProject(input: ProjectUpdateInput): Promise<Project> {
    const existingProject = await this.getProject(input.id)
    if (!existingProject) throw createError({ statusCode: 404, message: `Project not found with id ${input.id}` })

    if (existingProject.name !== input.name)
      await this.validateProjectName(input.name, existingProject.teamId, input.id)

    const [updatedProject] = await useDrizzle().update(tables.projects)
      .set(input)
      .where(eq(tables.projects.id, input.id))
      .returning()
    if (!updatedProject) throw createError({ statusCode: 422, message: 'Failed to update project' })
    await clearCache('Projects', updatedProject.teamId)
    await clearCache('Project', updatedProject.id)

    return updatedProject
  }

  getProject = withCache('Project', async (projectId: number): Promise<Project> => {
    const project = await useDrizzle().query.projects.findFirst({
      where: eq(tables.projects.id, projectId)
    })
    if (!project) throw createError({ statusCode: 404, message: `Project not found with id ${projectId}` })
    return project
  })

  getProjects = withCache<Project[]>('Projects', (teamId: number) => {
    return useDrizzle().query.projects.findMany({
      where: eq(tables.projects.teamId, teamId),
      orderBy: [desc(tables.projects.updatedAt)]
    })
  })

  async deleteProject(projectId: number, teamId: number): Promise<void> {
    await clearCache('Projects', teamId)
    await clearCache('Project', projectId)

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
      throw createError({ statusCode: 400, statusMessage: 'Project already exists in this team' })
    }
  }

  private async isProjectAlreadyExists(name: string, teamId: number, projectId?: number): Promise<boolean> {
    const conditions = [
      eq(tables.projects.teamId, teamId),
      sql`lower(${tables.projects.name}) like lower(${name})`
    ]

    if (projectId) conditions.push(not(eq(tables.projects.id, projectId)))

    const project = await useDrizzle().query.projects.findFirst({
      where: and(...conditions)
    })

    return !!project
  }

}
