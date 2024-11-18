import type { CreateVariableInput, CreateVariablesInput, Environment, UpdateVariableInput, Variable } from '@shelve/types'
import { seal, unseal } from '@shelve/crypto'

export class VariableService {

  private readonly encryptionKey: string
  private readonly ENV_ASSOCIATION = {
    production: 'production',
    preview: 'preview',
    staging: 'preview',
    development: 'development',
    prod: 'production',
    dev: 'development',
  } as const

  constructor() {
    this.encryptionKey = useRuntimeConfig().private.encryptionKey
  }

  // Single Variable Operations
  async createVariable(input: CreateVariableInput): Promise<Variable> {
    const encryptedValue = await seal(input.value, this.encryptionKey)

    const [createdVariable] = await db.insert(tables.variables)
      .values({
        projectId: input.projectId,
        key: input.autoUppercase ? input.key.toUpperCase() : input.key,
        value: encryptedValue,
        environment: this.normalizeEnvironment(input.environment)
      })
      .returning()
    if (!createdVariable) throw createError({ statusCode: 500, message: 'Failed to create variable' })

    return this.decryptVariable(createdVariable)
  }

  async updateVariable(input: UpdateVariableInput): Promise<Variable> {
    const variable = await this.getVariableById(input.id)

    const updateData: Partial<Variable> = {
      key: input.key ? (input.autoUppercase ? input.key.toUpperCase() : input.key) : variable.key,
      value: input.value ? await seal(input.value, this.encryptionKey) : variable.value,
      environment: input.environment ? this.normalizeEnvironment(input.environment) : variable.environment
    }

    const [updatedVariable] = await db.update(tables.variables)
      .set(updateData)
      .where(and(
        eq(tables.variables.id, input.id),
        eq(tables.variables.projectId, input.projectId)
      ))
      .returning()
    if (!updatedVariable) throw createError({ statusCode: 500, message: 'Failed to update variable' })

    return this.decryptVariable(updatedVariable)
  }

  async getVariableById(id: number): Promise<Variable> {
    const variable = await db.query.variables.findFirst({
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

  async deleteVariable(id: number): Promise<void> {
    const result = await db.delete(tables.variables)
      .where(eq(tables.variables.id, id))
      .returning()

    if (!result.length) {
      throw createError({
        statusCode: 404,
        message: `Variable not found with id ${id}`
      })
    }
  }

  // Multiple Variables Operations
  async createVariables(input: CreateVariablesInput): Promise<Variable[]> {
    const { projectId, variables, environment = 'development', autoUppercase = false, method = 'merge' } = input

    if (method === 'overwrite')
      await this.deleteProjectVariables(projectId, environment)

    const variablesToCreate = await Promise.all(
      variables.map(async (variable) => ({
        projectId,
        key: autoUppercase ? variable.key.toUpperCase() : variable.key,
        value: await seal(variable.value, this.encryptionKey),
        environment: this.normalizeEnvironment(environment)
      }))
    )

    const createdVariables = await db.insert(tables.variables)
      .values(variablesToCreate)
      .returning()

    return this.decryptVariables(createdVariables)
  }

  async getProjectVariables(projectId: number, environment?: Environment): Promise<Variable[]> {
    const variables = await db.query.variables.findMany({
      where: this.buildEnvironmentQuery(projectId, environment)
    })

    return await this.decryptVariables(variables)
  }

  // Helper Methods
  private async decryptVariable(variable: Variable): Promise<Variable> {
    return {
      ...variable,
      value: await unseal(variable.value, this.encryptionKey) as string
    }
  }

  private async decryptVariables(variables: Variable[]): Promise<Variable[]> {
    return await Promise.all(variables.map(this.decryptVariable.bind(this)))
  }

  private normalizeEnvironment(env: string): string {
    return env.split('|')
      .map(e => this.ENV_ASSOCIATION[e as Environment] || e)
      .filter(Boolean)
      .join('|')
  }

  private buildEnvironmentQuery(projectId: number, environment?: Environment) {
    if (!environment) {
      return eq(tables.variables.projectId, projectId)
    }

    return and(
      eq(tables.variables.projectId, projectId),
      like(tables.variables.environment, `%${this.normalizeEnvironment(environment)}%`)
    )
  }

  private async deleteProjectVariables(projectId: number, environment?: Environment): Promise<void> {
    await db.delete(tables.variables)
      .where(this.buildEnvironmentQuery(projectId, environment))
  }

}
