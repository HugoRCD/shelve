import type { Environment, CreateEnvironmentInput, UpdateEnvironmentInput } from '@types'
import { EnvType } from '@types'

export class EnvironmentsService {

  async createEnvironment(input: CreateEnvironmentInput): Promise<Environment> {
    const [environment] = await useDrizzle().insert(tables.environments)
      .values(input)
      .returning()

    if (!environment) throw createError({ statusCode: 422, statusMessage: 'Failed to create environment' })
    await clearCache('Environments', input.teamId)

    return environment
  }

  getEnvironments = withCache('Environments', async (teamId: number) => {
    return await useDrizzle().query.environments.findMany({
      where: eq(tables.environments.teamId, teamId)
    })
  })

  async getEnvironment(name: string, teamId: number): Promise<Environment> {
    const environment = await useDrizzle().query.environments.findFirst({
      where: and(eq(tables.environments.teamId, teamId), eq(tables.environments.name, name))
    })

    if (!environment) throw createError({ statusCode: 404, statusMessage: 'Environment not found' })

    return environment
  }

  async updateEnvironment(input: UpdateEnvironmentInput): Promise<Environment> {
    const [environment] = await useDrizzle().update(tables.environments)
      .set({
        name: input.name,
      })
      .where(eq(tables.environments.id, input.id))
      .returning()

    if (!environment) throw createError({ statusCode: 404, statusMessage: 'Environment not found' })
    await clearCache('Environments', input.teamId)

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
