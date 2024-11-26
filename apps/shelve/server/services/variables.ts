import type { UpdateVariableInput, CreateVariablesInput, Variable } from '@shelve/types'

export class VariablesService {

  private readonly encryptionKey: string

  constructor() {
    this.encryptionKey = useRuntimeConfig().private.encryptionKey
  }

  // Private utility methods
  private async encryptValue(value: string): Promise<string> {
    return await seal(value, this.encryptionKey)
  }

  private async decryptValue(value: string): Promise<string> {
    return await unseal(value, this.encryptionKey) as string
  }

  private async findVariableById(db: any, id: number) {
    return await db.query.variables.findFirst({
      where: eq(tables.variables.id, id),
      with: {
        values: {
          with: {
            environment: true
          }
        }
      }
    })
  }

  private async decryptVariable(variable: Variable): Promise<Variable> {
    return {
      ...variable,
      values: await Promise.all(
        variable.values.map(async v => ({
          ...v,
          value: await this.decryptValue(v.value)
        }))
      )
    }
  }

  // Public methods
  async createVariables(input: CreateVariablesInput): Promise<Variable[]> {
    const { projectId, variables: varsToCreate, autoUppercase = true, environmentIds } = input
    const db = useDrizzle()
    const createdVariables: Variable[] = []

    for (const variable of varsToCreate) {
      const key = autoUppercase ? variable.key.toUpperCase() : variable.key
      const encryptedValue = await this.encryptValue(variable.value)

      // Find or create variable
      const variableId = await this.getOrCreateVariableId(db, projectId, key)

      // Update values for all environments
      await Promise.all(environmentIds.map(envId =>
        this.upsertVariableValue(db, variableId, envId, encryptedValue)
      ))

      const result = await this.findVariableById(db, variableId)
      if (result) {
        createdVariables.push(await this.decryptVariable(result))
      }
    }

    await clearCache('Variables', projectId)
    return createdVariables
  }

  getVariables = withCache<Variable[]>('Variables', async (projectId: number, environmentId?: number) => {
    const db = useDrizzle()
    const variables = await db.query.variables.findMany({
      where: eq(tables.variables.projectId, projectId),
      with: {
        values: {
          with: {
            environment: true
          }
        }
      }
    })

    return environmentId
      ? variables.filter(v => v.values.some(val => val.environmentId === environmentId))
      : variables
  })

  async updateVariable(input: UpdateVariableInput): Promise<Variable> {
    const { id, projectId, key, values, autoUppercase = true } = input
    const db = useDrizzle()

    const existingVariable = await this.findVariableById(db, id)
    if (!existingVariable) {
      throw createError({ statusCode: 404, message: `Variable not found with id ${id}` })
    }

    const updatedKey = autoUppercase ? key.toUpperCase() : key
    if (updatedKey !== existingVariable.key) {
      await this.updateVariableKey(db, id, updatedKey)
    }

    await Promise.all(values.map(async valueInput => {
      const encryptedValue = await this.encryptValue(valueInput.value)
      return this.upsertVariableValue(db, id, valueInput.environmentId, encryptedValue)
    }))

    const updated = await this.findVariableById(db, id)
    if (!updated) {
      throw createError({ statusCode: 500, message: 'Failed to update variable' })
    }

    await clearCache('Variables', projectId)
    return this.decryptVariable(updated)
  }

  async deleteVariable(id: number): Promise<void> {
    const [result] = await useDrizzle()
      .delete(tables.variables)
      .where(eq(tables.variables.id, id))
      .returning()

    if (!result) {
      throw createError({ statusCode: 404, message: `Variable not found with id ${id}` })
    }

    await clearCache('Variables', result.projectId)
  }

  async decryptVariables(variables: Variable[]): Promise<Variable[]> {
    return await Promise.all(variables.map(v => this.decryptVariable(v)))
  }

  // Private helper methods for database operations
  private async getOrCreateVariableId(db: any, projectId: number, key: string): Promise<number> {
    const existingVariable = await db.query.variables.findFirst({
      where: and(
        eq(tables.variables.projectId, projectId),
        eq(tables.variables.key, key)
      )
    })

    if (existingVariable) {
      return existingVariable.id
    }

    const [created] = await db.insert(tables.variables)
      .values({ projectId, key })
      .returning()

    if (!created) {
      throw createError({ statusCode: 500, message: 'Failed to create variable' })
    }

    return created.id
  }

  private async upsertVariableValue(db: any, variableId: number, environmentId: number, value: string) {
    return await db.insert(tables.variableValues)
      .values({
        variableId,
        environmentId,
        value
      })
      .onConflictDoUpdate({
        target: [
          tables.variableValues.variableId,
          tables.variableValues.environmentId
        ],
        set: { value }
      })
  }

  private async updateVariableKey(db: any, id: number, key: string) {
    return await db.update(tables.variables)
      .set({ key })
      .where(eq(tables.variables.id, id))
  }

}
