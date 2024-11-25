import type { UpdateVariableInput, CreateVariablesInput, Variable } from '@shelve/types'

export class VariablesService {

  private readonly encryptionKey: string

  constructor() {
    this.encryptionKey = useRuntimeConfig().private.encryptionKey
  }

  /**
   * Create or update variables respecting some rules
   * - If a variable key exists, it will be updated in the specified environments
   * - If a variable does not exist in any of the specified environments, it will be created
   * - If autoUppercase is true, the keys will be automatically converted to uppercase
   * @param input
   */
  async createVariables(input: CreateVariablesInput): Promise<Variable[]> {
    const { projectId, variables: varsToCreate, autoUppercase = true } = input
    const db = useDrizzle()
    const createdVariables: Variable[] = []

    for (const variable of varsToCreate) {
      const key = autoUppercase ? variable.key.toUpperCase() : variable.key
      const encryptedValue = await seal(variable.value, this.encryptionKey)

      const existingVariable = await db.query.variables.findFirst({
        where: and(
          eq(tables.variables.projectId, projectId),
          eq(tables.variables.key, key)
        ),
        with: {
          values: true
        }
      })

      let variableId: number

      if (existingVariable) {
        variableId = existingVariable.id
      } else {
        const [created] = await db.insert(tables.variables)
          .values({
            projectId,
            key
          })
          .returning()
        if (!created) throw createError({ statusCode: 500, message: 'Failed to create variable' })
        variableId = created.id
      }

      for (const envId of input.environmentIds) {
        await db.insert(tables.variableValues)
          .values({
            variableId,
            environmentId: envId,
            value: encryptedValue
          })
          .onConflictDoUpdate({
            target: [
              tables.variableValues.variableId,
              tables.variableValues.environmentId
            ],
            set: {
              value: encryptedValue
            }
          })
      }

      const result = await db.query.variables.findFirst({
        where: eq(tables.variables.id, variableId),
        with: {
          values: {
            with: {
              environment: true
            }
          }
        }
      })

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

    const _variables = await Promise.all(
      variables.map(async variable => ({
        id: variable.id,
        key: variable.key,
        projectId: variable.projectId,
        values: await Promise.all(variable.values.map(v => ({
          environmentId: v.environmentId,
          value: v.value,
          environment: v.environment
        }))),
        createdAt: variable.createdAt,
        updatedAt: variable.updatedAt
      }))
    )

    if (environmentId) {
      return _variables.filter(v =>
        v.values.some(val => val.environmentId === environmentId)
      )
    }

    return _variables
  })

  async updateVariable(input: UpdateVariableInput): Promise<Variable> {
    const { id, projectId, key, values, autoUppercase = true } = input
    const db = useDrizzle()

    const existingVariable = await db.query.variables.findFirst({
      where: eq(tables.variables.id, id),
      with: {
        values: true
      }
    })

    if (!existingVariable) {
      throw createError({
        statusCode: 404,
        message: `Variable not found with id ${id}`
      })
    }

    const updatedKey = autoUppercase ? key.toUpperCase() : key
    if (updatedKey !== existingVariable.key) {
      await db.update(tables.variables)
        .set({ key: updatedKey })
        .where(eq(tables.variables.id, id))
    }

    for (const valueInput of values) {
      const encryptedValue = await seal(valueInput.value, this.encryptionKey)

      await db
        .insert(tables.variableValues)
        .values({
          variableId: id,
          environmentId: valueInput.environmentId,
          value: encryptedValue
        })
        .onConflictDoUpdate({
          target: [
            tables.variableValues.variableId,
            tables.variableValues.environmentId,
          ],
          set: { value: encryptedValue }
        })
    }

    const updated = await db.query.variables.findFirst({
      where: eq(tables.variables.id, id),
      with: {
        values: {
          with: {
            environment: true
          }
        }
      }
    })

    if (!updated) throw createError({ statusCode: 500, message: 'Failed to update variable' })

    await clearCache('Variables', projectId)
    return this.decryptVariable(updated)
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

  private async decryptVariable(variable: Variable): Promise<Variable> {
    return {
      ...variable,
      values: await Promise.all(variable.values.map(async v => ({
        ...v,
        value: await unseal(v.value, this.encryptionKey) as string
      })))
    }
  }

  async decryptVariables(variables: Variable[]): Promise<Variable[]> {
    return await Promise.all(variables.map(this.decryptVariable.bind(this)))
  }

}
