import type { UpdateVariableInput, CreateVariablesInput, Variable } from '@types'

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

  incrementStatAsync(teamId: number, action: 'push' | 'pull') {
    Promise.resolve().then(async () => {
      try {
        const db = useDrizzle()
        await db.insert(tables.teamStats)
          .values({
            teamId,
            [`${action}Count`]: 1
          })
          .onConflictDoUpdate({
            target: [tables.teamStats.teamId],
            set: {
              [`${action}Count`]: sql`${tables.teamStats[`${action}Count`]} + 1`,
              updatedAt: new Date().toISOString()
            }
          })
          .catch((error) => {
            console.error('Failed to increment stat', error)
          })
      } catch { /* empty */ }
    })
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

    const preparedVariables = await Promise.all(
      varsToCreate.map(async (variable) => ({
        key: autoUppercase ? variable.key.toUpperCase() : variable.key,
        encryptedValue: await this.encryptValue(variable.value)
      }))
    )

    const variableRecords = await Promise.all(
      preparedVariables.map(async ({ key }) => {
        const existing = await db.query.variables.findFirst({
          where: and(
            eq(tables.variables.projectId, projectId),
            eq(tables.variables.key, key)
          )
        })

        if (existing) return existing

        const [created] = await db.insert(tables.variables)
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
      const chunkSize = 100
      for (let i = 0; i < variableValues.length; i += chunkSize) {
        const chunk = variableValues.slice(i, i + chunkSize)
        for (const value of chunk) {
          const existing = await db.query.variableValues.findFirst({
            where: and(
              eq(tables.variableValues.variableId, value.variableId),
              eq(tables.variableValues.environmentId, value.environmentId)
            )
          })

          if (existing) {
            await db.update(tables.variableValues)
              .set({
                value: value.value,
                updatedAt: new Date().toISOString()
              })
              .where(and(
                eq(tables.variableValues.variableId, value.variableId),
                eq(tables.variableValues.environmentId, value.environmentId)
              ))
          } else {
            await db.insert(tables.variableValues)
              .values({
                ...value,
                updatedAt: new Date().toISOString()
              })
          }
        }
      }
    }

    await clearCache('Variables', projectId)
  }

  async updateVariable(input: UpdateVariableInput): Promise<void> {
    const { id, key, values, autoUppercase = true } = input
    const db = useDrizzle()

    const existingVariable = await this.findVariableById(db, id)
    if (!existingVariable) {
      throw createError({ statusCode: 404, statusMessage: `Variable not found with id ${id}` })
    }

    const updatedKey = autoUppercase ? key.toUpperCase() : key
    if (updatedKey !== existingVariable.key) {
      await this.updateVariableKey(db, id, updatedKey)
    }

    await Promise.all(values.map(async valueInput => {
      const encryptedValue = await this.encryptValue(valueInput.value)
      return this.upsertVariableValue(db, id, valueInput.environmentId, encryptedValue)
    }))

    await clearCache('Variables', existingVariable.projectId)
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

  private async upsertVariableValue(db: any, variableId: number, environmentId: number, value: string) {
    const existing = await db.query.variableValues.findFirst({
      where: and(
        eq(tables.variableValues.variableId, variableId),
        eq(tables.variableValues.environmentId, environmentId)
      )
    })

    if (existing) {
      await db.update(tables.variableValues)
        .set({ value })
        .where(and(
          eq(tables.variableValues.variableId, variableId),
          eq(tables.variableValues.environmentId, environmentId)
        ))
    } else {
      await db.insert(tables.variableValues)
        .values({
          variableId,
          environmentId,
          value
        })
    }
  }

  private async updateVariableKey(tx: any, id: number, key: string) {
    return await tx.update(tables.variables)
      .set({ key })
      .where(eq(tables.variables.id, id))
  }

}
