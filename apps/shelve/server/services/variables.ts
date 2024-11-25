import type { UpsertVariablesInput, Environment, Variable } from '@shelve/types'
import { variableEnvironments, variables as variablesTable } from '~~/server/database/schema'

export class VariablesService {

  private readonly encryptionKey: string

  constructor() {
    this.encryptionKey = useRuntimeConfig().private.encryptionKey
  }

  async upsertVariables(input: UpsertVariablesInput): Promise<Variable[]> {
    const {
      projectId,
      variables: varsToUpsert,
      environmentIds,
      autoUppercase = false,
      method = 'merge'
    } = input

    const db = useDrizzle()
    const createdVariables: Variable[] = []

    await clearCache('Variables', projectId)
    return this.decryptVariables(createdVariables)
  }

  getVariables = withCache<Variable[]>('Variables', async (projectId: number, environmentId?: number) => {
    // TODO
    return []
  })

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
      value: await unseal(variable.value, this.encryptionKey) as string
    }
  }

  async decryptVariables(variables: Variable[]): Promise<Variable[]> {
    return await Promise.all(variables.map(this.decryptVariable.bind(this)))
  }

}
