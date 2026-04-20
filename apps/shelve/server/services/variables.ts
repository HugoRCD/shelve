import type { UpdateVariableInput, CreateVariablesInput, Variable } from '@types'
import type { H3Event } from 'h3'
import { GithubService } from './github'
import { ProjectsService } from './projects'
import { EncryptionService } from './encryption'

export class VariablesService {

  private readonly encryption: EncryptionService

  constructor(event: H3Event) {
    this.encryption = new EncryptionService(event)
  }

  incrementStatAsync(teamId: number, action: 'push' | 'pull') {
    Promise.resolve().then(async () => {
      try {
        await db.insert(schema.teamStats)
          .values({
            teamId,
            [`${action}Count`]: 1
          })
          .onConflictDoUpdate({
            target: [schema.teamStats.teamId],
            set: {
              [`${action}Count`]: sql`${schema.teamStats[`${action}Count`]} + 1`,
              updatedAt: new Date()
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
      where: eq(schema.variables.id, id),
    })
  }

  private async decryptVariable(variable: Variable): Promise<Variable> {
    return {
      ...variable,
      values: await Promise.all(
        variable.values.map(async v => ({
          ...v,
          value: await this.encryption.decrypt(variable.projectId, v.value)
        }))
      )
    }
  }

  // Public methods
  async createVariables(event: H3Event, input: CreateVariablesInput): Promise<void> {
    const { projectId, variables: varsToCreate, autoUppercase = true, environmentIds, syncWithGitHub } = input

    await db.transaction(async (tx) => {
      const preparedVariables = await Promise.all(
        varsToCreate.map(async (variable) => ({
          key: autoUppercase ? variable.key.toUpperCase() : variable.key,
          description: variable.description,
          encryptedValue: await this.encryption.encrypt(projectId, variable.value)
        }))
      )

      const variableRecords = await Promise.all(
        preparedVariables.map(async ({ key, description }) => {
          const existing = await tx.query.variables.findFirst({
            where: and(
              eq(schema.variables.projectId, projectId),
              eq(schema.variables.key, key)
            )
          })

          if (existing) {
            if (description !== undefined) {
              await tx.update(schema.variables)
                .set({ description })
                .where(eq(schema.variables.id, existing.id))
            }
            return existing
          }

          const [created] = await tx.insert(schema.variables)
            .values({ projectId, key, description: description || null })
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
        await tx.insert(schema.variableValues)
          .values(variableValues)
          .onConflictDoUpdate({
            target: [
              schema.variableValues.variableId,
              schema.variableValues.environmentId
            ],
            set: {
              value: sql`EXCLUDED.value`,
              updatedAt: new Date()
            }
          })
      }
    })

    await clearCache('Variables', projectId)

    if (syncWithGitHub) {
      const { user } = await requireUserSession(event)
      const project = await new ProjectsService().getProject(projectId)
      if (!project || !project.repository) throw createError({ statusCode: 400, statusMessage: 'No GitHub repository linked to this project.' })
      const variablesToSend = varsToCreate.map(v => ({ key: autoUppercase ? v.key.toUpperCase() : v.key, value: v.value }))
      await new GithubService(event).sendSecrets(user.id, project.repository, variablesToSend)
    }
  }

  async updateVariable(input: UpdateVariableInput): Promise<void> {
    const { id, key, values, autoUppercase = true, description, groupId } = input

    await db.transaction(async (tx) => {
      const existingVariable = await this.findVariableById(tx, id)
      if (!existingVariable) throw createError({ statusCode: 404, statusMessage: `Variable not found with id ${id}` })

      const updatedKey = autoUppercase ? key.toUpperCase() : key
      const updates: Record<string, unknown> = {}

      if (updatedKey !== existingVariable.key) updates.key = updatedKey
      if (description !== undefined) updates.description = description
      if (groupId !== undefined) updates.groupId = groupId

      if (Object.keys(updates).length > 0) {
        await tx.update(schema.variables)
          .set(updates)
          .where(eq(schema.variables.id, id))
      }

      await Promise.all(values.map(async valueInput => {
        const encryptedValue = await this.encryption.encrypt(existingVariable.projectId, valueInput.value)
        return this.upsertVariableValue(tx, id, valueInput.environmentId, encryptedValue)
      }))

      await clearCache('Variables', existingVariable.projectId)
    })
  }

  getVariables = withCache<Variable[]>('Variables', async (projectId: number, environmentId?: number) => {
    const variables = await db.query.variables.findMany({
      where: eq(schema.variables.projectId, projectId),
      with: {
        group: true,
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

  async bulkAssignGroup(variableIds: number[], groupId: number | null): Promise<void> {
    if (!variableIds.length) return

    await db.update(schema.variables)
      .set({ groupId })
      .where(inArray(schema.variables.id, variableIds))

    const first = await db.query.variables.findFirst({
      where: eq(schema.variables.id, variableIds[0]!),
    })
    if (first) await clearCache('Variables', first.projectId)
  }

  async deleteVariable(id: number): Promise<void> {
    const [deleted] = await db.delete(schema.variables)
      .where(eq(schema.variables.id, id))
      .returning()

    if (!deleted) throw createError({ statusCode: 404, statusMessage: `Variable not found with id ${id}` })

    await clearCache('Variables', deleted.projectId)
  }

  async decryptVariables(variables: Variable[]): Promise<Variable[]> {
    return await Promise.all(variables.map(v => this.decryptVariable(v)))
  }

  private async upsertVariableValue(tx: any, variableId: number, environmentId: number, value: string) {
    return await tx.insert(schema.variableValues)
      .values({
        variableId,
        environmentId,
        value
      })
      .onConflictDoUpdate({
        target: [
          schema.variableValues.variableId,
          schema.variableValues.environmentId
        ],
        set: { value }
      })
  }


}
