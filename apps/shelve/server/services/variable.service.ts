import type { CreateVariablesInput, UpdateVariableInput, Variable } from '@shelve/types'
import { EnvType } from '@shelve/types'

export class VariableService {

  private readonly encryptionKey: string
  private readonly ENV_ASSOCIATION = {
    production: EnvType.PRODUCTION,
    preview: EnvType.PREVIEW,
    development: EnvType.DEVELOPMENT,
  } as const

  constructor() {
    this.encryptionKey = useRuntimeConfig().private.encryptionKey
  }

  async updateVariable(input: UpdateVariableInput, decrypt: boolean = true): Promise<Variable> {
    const variable = await this.getVariableById(input.id)

    const updateData: Partial<Variable> = {
      key: input.key ? (input.autoUppercase ? input.key.toUpperCase() : input.key) : variable.key,
      value: input.value ? await seal(input.value, this.encryptionKey) : variable.value,
      environment: input.environment ? this.normalizeEnvironment(input.environment) : variable.environment
    }

    const [updatedVariable] = await useDrizzle().update(tables.variables)
      .set(updateData)
      .where(and(
        eq(tables.variables.id, input.id),
        eq(tables.variables.projectId, input.projectId)
      ))
      .returning()
    if (!updatedVariable) throw createError({ statusCode: 500, message: 'Failed to update variable' })

    await clearCache('Variables', updatedVariable.projectId)
    return decrypt ? this.decryptVariable(updatedVariable) : updatedVariable
  }

  async getVariableById(id: number): Promise<Variable> {
    const variable = await useDrizzle().query.variables.findFirst({
      where: eq(tables.variables.id, id),
      with: {
        project: true
      }
    })

    if (!variable) {
      throw createError({
        statusCode: 404,
        message: `Variable not found with id ${id}`
      })
    }

    return this.decryptVariable(variable)
  }

  async getVariableByIdAndEnv(projectId: number, environment: EnvType): Promise<Variable[]> {
    const variables = await useDrizzle().query.variables.findMany({
      where: this.buildEnvironmentQuery(projectId, environment)
    })

    return await this.decryptVariables(variables)
  }

  async deleteVariable(id: number): Promise<void> {
    const [result] = await useDrizzle().delete(tables.variables)
      .where(eq(tables.variables.id, id))
      .returning()

    if (!result) {
      throw createError({
        statusCode: 404,
        message: `Variable not found with id ${id}`
      })
    }

    await clearCache('Variables', result.projectId)
  }

  // Multiple Variables Operations
  async createVariables(input: CreateVariablesInput): Promise<Variable[]> {
    const {
      projectId,
      variables,
      environment = 'development',
      autoUppercase = false,
      method = 'merge'
    } = input

    const normalizedEnv = this.normalizeEnvironment(environment)

    if (method === 'overwrite') await this.deleteProjectVariables(projectId, normalizedEnv)

    const existingVariables = await this.getVariableByIdAndEnv(projectId, environment as EnvType)

    const variablesToUpsert = await Promise.all(
      variables.map(async (variable) => {
        const key = autoUppercase ? variable.key.toUpperCase() : variable.key
        const existingVariable = existingVariables.find(v =>
          v.key === key &&
          v.environment === normalizedEnv
        )

        if (existingVariable) {
          return this.updateVariable({
            id: existingVariable.id,
            projectId,
            key,
            value: variable.value,
            environment: normalizedEnv
          }, false)
        }

        return await useDrizzle().insert(tables.variables)
          .values({
            projectId,
            key,
            value: await seal(variable.value, this.encryptionKey),
            environment: normalizedEnv
          })
          .returning()
          .then(([v]) => v)
      })
    )

    await clearCache('Variables', projectId)
    return this.decryptVariables(variablesToUpsert)
  }

  getVariables = withCache('Variables', async (projectId: number, environment?: EnvType): Promise<Variable[]> => {
    return await useDrizzle().query.variables.findMany({
      where: this.buildEnvironmentQuery(projectId, environment)
    })
  })

  private async decryptVariable(variable: Variable): Promise<Variable> {
    return {
      ...variable,
      value: await unseal(variable.value, this.encryptionKey) as string
    }
  }

  async decryptVariables(variables: Variable[]): Promise<Variable[]> {
    return await Promise.all(variables.map(this.decryptVariable.bind(this)))
  }

  private normalizeEnvironment(env: string): EnvType {
    const envs = env.split('|')
    return envs.map(e => this.ENV_ASSOCIATION[e as EnvType] || e).filter(Boolean).join('|') as EnvType
  }

  private buildEnvironmentQuery(projectId: number, environment?: EnvType) {
    if (!environment) {
      return eq(tables.variables.projectId, projectId)
    }

    const normalizedEnv = this.normalizeEnvironment(environment)
    return and(
      eq(tables.variables.projectId, projectId),
      eq(tables.variables.environment, normalizedEnv)
    )
  }

  private async deleteProjectVariables(projectId: number, environment?: EnvType): Promise<void> {
    await useDrizzle().delete(tables.variables)
      .where(this.buildEnvironmentQuery(projectId, environment))
  }

}
