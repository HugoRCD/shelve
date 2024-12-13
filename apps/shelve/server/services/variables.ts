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

  private async findVariableById(tx: any, id: number) {
    return await tx.query.variables.findFirst({
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
  async createVariables(input: CreateVariablesInput): Promise<void> {
    const { projectId, variables: varsToCreate, autoUppercase = true, environmentIds } = input
    const db = useDrizzle()

    await db.transaction(async (tx) => {
      const preparedVariables = await Promise.all(
        varsToCreate.map(async (variable) => ({
          key: autoUppercase ? variable.key.toUpperCase() : variable.key,
          encryptedValue: await this.encryptValue(variable.value)
        }))
      )

      const variableRecords = await Promise.all(
        preparedVariables.map(async ({ key }) => {
          const existing = await tx.query.variables.findFirst({
            where: and(
              eq(tables.variables.projectId, projectId),
              eq(tables.variables.key, key)
            )
          })

          if (existing) return existing

          const [created] = await tx.insert(tables.variables)
            .values({ projectId, key })
            .returning()

          return created
        })
      )

      const variableValues = variableRecords.flatMap(variable => {
        const preparedVar = preparedVariables.find(v => v.key === variable.key)
        if (!preparedVar) return []

        return environmentIds.map(environmentId => ({
          variableId: variable.id,
          environmentId,
          value: preparedVar.encryptedValue
        }))
      })

      if (variableValues.length > 0) {
        await tx.insert(tables.variableValues)
          .values(variableValues)
          .onConflictDoUpdate({
            target: [
              tables.variableValues.variableId,
              tables.variableValues.environmentId
            ],
            set: {
              value: sql`EXCLUDED.value`,
              updatedAt: new Date()
            }
          })
      }
    })

    await clearCache('Variables', projectId)
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

  async updateVariable(input: UpdateVariableInput): Promise<void> {
    const { id, key, values, autoUppercase = true } = input
    const db = useDrizzle()

    await db.transaction(async (tx) => {
      const existingVariable = await this.findVariableById(tx, id)
      if (!existingVariable) throw createError({ statusCode: 404, statusMessage: `Variable not found with id ${id}` })

      const updatedKey = autoUppercase ? key.toUpperCase() : key
      if (updatedKey !== existingVariable.key) {
        await this.updateVariableKey(tx, id, updatedKey)
      }

      await Promise.all(values.map(async valueInput => {
        const encryptedValue = await this.encryptValue(valueInput.value)
        return this.upsertVariableValue(tx, id, valueInput.environmentId, encryptedValue)
      }))

      await clearCache('Variables', existingVariable.projectId)
    })
  }

  async deleteVariable(id: number): Promise<void> {
    const [deleted] = await useDrizzle().delete(tables.variables)
      .where(eq(tables.variables.id, id))
      .returning()

    if (!deleted) throw createError({ statusCode: 404, statusMessage: `Variable not found with id ${id}` })

    await clearCache('Variables', deleted.projectId)
  }

  async decryptVariables(variables: Variable[]): Promise<Variable[]> {
    return await Promise.all(variables.map(v => this.decryptVariable(v)))
  }

  private async upsertVariableValue(tx: any, variableId: number, environmentId: number, value: string) {
    return await tx.insert(tables.variableValues)
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

  private async updateVariableKey(tx: any, id: number, key: string) {
    return await tx.update(tables.variables)
      .set({ key })
      .where(eq(tables.variables.id, id))
  }

}
