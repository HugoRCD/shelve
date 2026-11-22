import type { Environment, CreateEnvironmentInput, UpdateEnvironmentInput } from '@types'
import { EnvType } from '@types'
import { isNotNull } from 'drizzle-orm'

export class EnvironmentsService {

  async createEnvironment(input: CreateEnvironmentInput): Promise<Environment> {
    const [environment] = await db.insert(schema.environments)
      .values(input)
      .returning()

    if (!environment) throw createError({ statusCode: 422, statusMessage: 'Failed to create environment' })
    await clearCache('Environments', input.teamId)

    return environment
  }

  getEnvironments = withCache('Environments', async (teamId: number) => {
    return await db.query.environments.findMany({
      where: eq(schema.environments.teamId, teamId)
    })
  })

  async getEnvironment(name: string, teamId: number): Promise<Environment> {
    const environment = await db.query.environments.findFirst({
      where: and(eq(schema.environments.teamId, teamId), eq(schema.environments.name, name))
    })

    if (!environment) throw createError({ statusCode: 404, statusMessage: 'Environment not found' })

    return environment
  }

  /** Renames the environment and carries the new name into every project's sync policy, so its protection follows it. */
  async updateEnvironment(input: UpdateEnvironmentInput): Promise<{ environment: Environment, previousName: string }> {
    const { environment, previousName, updatedProjectIds } = await db.transaction(async (tx) => {
      const previous = await tx.query.environments.findFirst({
        where: and(eq(schema.environments.id, input.id), eq(schema.environments.teamId, input.teamId)),
        columns: { name: true },
      })
      if (!previous) throw createError({ statusCode: 404, statusMessage: 'Environment not found' })

      const [environment] = await tx.update(schema.environments)
        .set({ name: input.name })
        .where(and(eq(schema.environments.id, input.id), eq(schema.environments.teamId, input.teamId)))
        .returning()
      if (!environment) throw createError({ statusCode: 404, statusMessage: 'Environment not found' })

      const projects = await tx.query.projects.findMany({
        where: and(eq(schema.projects.teamId, input.teamId), isNotNull(schema.projects.syncPolicy)),
        columns: { id: true, syncPolicy: true },
      })
      const updatedProjectIds: number[] = []
      for (const project of projects) {
        const syncPolicy = renameEnvironmentInSyncPolicy(project.syncPolicy, previous.name, environment.name)
        if (syncPolicy === project.syncPolicy) continue
        await tx.update(schema.projects).set({ syncPolicy }).where(eq(schema.projects.id, project.id))
        updatedProjectIds.push(project.id)
      }

      return { environment, previousName: previous.name, updatedProjectIds }
    })

    // Clear the caches once the change is committed, or a concurrent read could cache the old rows again.
    await clearCache('Environments', input.teamId)
    if (updatedProjectIds.length) await clearCache('Projects', input.teamId)
    for (const projectId of updatedProjectIds) await clearCache('Project', projectId)

    return { environment, previousName }
  }

  async initializeBaseEnvironments(teamId: number): Promise<void> {
    const baseEnvironments = Object.values(EnvType).map(name => ({
      teamId,
      name,
    }))

    await db.insert(schema.environments).values(baseEnvironments)
  }

}
