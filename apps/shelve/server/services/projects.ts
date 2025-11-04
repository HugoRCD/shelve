import type { CreateProjectInput, Project, ProjectUpdateInput } from '@types'

export class ProjectsService {

  async createProject(input: CreateProjectInput): Promise<Project> {
    await this.validateProjectName(input.name, input.teamId)

    const [createdProject] = await db.insert(schema.projects)
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

    const [updatedProject] = await db.update(schema.projects)
      .set(input)
      .where(eq(schema.projects.id, input.id))
      .returning()
    if (!updatedProject) throw createError({ statusCode: 422, message: 'Failed to update project' })
    await clearCache('Projects', updatedProject.teamId)
    await clearCache('Project', updatedProject.id)

    return updatedProject
  }

  getProject = withCache('Project', async (projectId: number): Promise<Project> => {
    const project = await db.query.projects.findFirst({
      where: eq(schema.projects.id, projectId)
    })
    if (!project) throw createError({ statusCode: 404, message: `Project not found with id ${projectId}` })
    return project
  })

  getProjects = withCache<Project[]>('Projects', (teamId: number) => {
    return db.query.projects.findMany({
      where: eq(schema.projects.teamId, teamId),
      orderBy: [desc(schema.projects.updatedAt)]
    })
  })

  async deleteProject(projectId: number, teamId: number): Promise<void> {
    await clearCache('Projects', teamId)
    await clearCache('Project', projectId)

    await db.delete(schema.projects)
      .where(and(
        eq(schema.projects.id, projectId),
        eq(schema.projects.teamId, teamId)
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
      eq(schema.projects.teamId, teamId),
      ilike(schema.projects.name, name)
    ]

    if (projectId) conditions.push(not(eq(schema.projects.id, projectId)))

    const project = await db.query.projects.findFirst({
      where: and(...conditions)
    })

    return !!project
  }

}
