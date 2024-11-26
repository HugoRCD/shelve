import type { Environment, CreateEnvironmentInput, UpdateEnvironmentInput } from '@shelve/types'
import { EnvType } from '@shelve/types'

export class EnvironmentsService {

  async createEnvironment(input: CreateEnvironmentInput): Promise<Environment> {
    const [environment] = await useDrizzle().insert(tables.environments)
      .values(input)
      .returning()

    if (!environment) throw createError({
      statusCode: 500,
      message: 'Failed to create environment'
    })

    return environment
  }

  async getEnvironments(teamId: number): Promise<Environment[]> {
    return await useDrizzle().query.environments.findMany({
      where: eq(tables.environments.teamId, teamId),
      orderBy: [asc(tables.environments.name)]
    })
  }

  async updateEnvironment(input: UpdateEnvironmentInput): Promise<Environment> {
    const [environment] = await useDrizzle().update(tables.environments)
      .set({
        name: input.name,
      })
      .where(eq(tables.environments.id, input.id))
      .returning()

    if (!environment) throw createError({
      statusCode: 404,
      message: 'Environment not found'
    })

    return environment
  }

  async initializeBaseEnvironments(teamId: number): Promise<void> {
    const baseEnvironments = Object.values(EnvType).map(name => ({
      teamId,
      name,
    }))

    await useDrizzle().insert(tables.environments).values(baseEnvironments)
  }

}
