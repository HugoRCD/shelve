import type { Environment, User, Variable, VariablesCreateInput } from '@shelve/types'
import { unseal, seal } from '@shelve/crypto'

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

  /**
   * Upsert variables
   */
  async upsertVariable(variablesCreateInput: VariablesCreateInput): Promise<Variable | Variable[]> {
    const encryptedVariables = await this.encryptVariables(
      variablesCreateInput.variables,
      variablesCreateInput.autoUppercase
    )

    if (variablesCreateInput.variables.length === 1) {
      return this.upsertSingleVariable(encryptedVariables[0])
    }

    return this.upsertMultipleVariables(
      encryptedVariables,
      variablesCreateInput.projectId,
      variablesCreateInput.method || 'merge',
      variablesCreateInput.environment
    )
  }

  /**
   * Get variables by project ID
   */
  async getVariablesByProjectId(projectId: number, environment?: Environment): Promise<Variable[]> {
    const where = this.buildVariableQuery(projectId, environment)
    const variables = await prisma.variables.findMany({
      where,
      orderBy: { updatedAt: 'desc' }
    })
    return this.decryptVariables(variables)
  }

  /**
   * Delete single variable
   */
  async deleteVariable(id: number, environment: string): Promise<void> {
    const envs = environment.split('|').map((env) => decodeURIComponent(env))
    await prisma.variables.delete({
      where: {
        id,
        environment: { in: envs },
      },
    })
  }

  /**
   * Delete multiple variables
   */
  async deleteVariables(variablesId: number[], user: User): Promise<void> {
    await this.validateVariablesOwnership(variablesId, user)
    await prisma.variables.deleteMany({
      where: { id: { in: variablesId } }
    })
  }

  /**
   * Private helper methods
   */
  private async encryptVariables(
    variables: VariablesCreateInput['variables'],
    autoUppercase?: boolean
  ): Promise<VariablesCreateInput['variables']> {
    return Promise.all(variables.map(async (variable) => {
      const processed = { ...variable }
      if (autoUppercase) {
        processed.key = processed.key.toUpperCase()
      }
      processed.value = await seal(processed.value, this.encryptionKey)
      processed.environment = this.getEnvString(processed.environment)
      delete processed.index
      return processed
    }))
  }

  private async decryptVariables(
    variables: VariablesCreateInput['variables']
  ): Promise<VariablesCreateInput['variables']> {
    return Promise.all(variables.map(async (variable) => {
      const processed = { ...variable }
      processed.value = await unseal(processed.value, this.encryptionKey)
      processed.environment = this.getEnvString(processed.environment)
      return processed
    }))
  }

  private getEnvString(env: string): string {
    return env.split('|')
      .map((env) => this.ENV_ASSOCIATION[env as Environment])
      .join('|')
  }

  private async upsertSingleVariable(variable: Variable): Promise<Variable> {
    if (!variable) {
      throw createError({
        statusCode: 400,
        message: 'Invalid variable'
      })
    }

    return prisma.variables.upsert({
      where: { id: variable.id || -1 },
      update: variable,
      create: variable,
    })
  }

  private async upsertMultipleVariables(
    variables: Variable[],
    projectId: number,
    method: 'merge' | 'overwrite',
    environment: Environment
  ): Promise<Variable[]> {
    if (method === 'overwrite') {
      await this.deleteExistingVariables(projectId, environment)
      await prisma.variables.createMany({
        data: variables,
        skipDuplicates: true,
      })
      return variables
    }

    return this.mergeVariables(variables, projectId)
  }

  private async deleteExistingVariables(projectId: number, environment: Environment): Promise<void> {
    await prisma.variables.deleteMany({
      where: {
        projectId,
        environment: this.ENV_ASSOCIATION[environment]
      }
    })
  }

  private async mergeVariables(variables: Variable[], projectId: number): Promise<Variable[]> {
    const existingVariables = await prisma.variables.findMany({
      where: {
        projectId,
        key: { in: variables.map(v => v.key) }
      },
      select: { id: true }
    })

    for (const variable of variables) {
      if (existingVariables.some(ev => ev.id === variable.id)) {
        await prisma.variables.update({
          where: { id: variable.id },
          data: variable,
        })
      } else {
        await prisma.variables.create({
          data: variable,
        })
      }
    }

    return variables
  }

  private buildVariableQuery(projectId: number, environment?: Environment) {
    if (!environment) return { projectId }
    return {
      projectId,
      environment: {
        contains: this.ENV_ASSOCIATION[environment],
      }
    }
  }

  private async validateVariablesOwnership(variablesId: number[], user: User): Promise<void> {
    const variables = await prisma.variables.findMany({
      where: {
        id: { in: variablesId }
      },
      select: {
        id: true,
        project: {
          select: { ownerId: true }
        }
      }
    })

    const hasPermission = variables.every(v => v.project.ownerId === user.id)
    if (!hasPermission) {
      throw createError({
        statusCode: 403,
        message: 'You do not have permission to delete these variables'
      })
    }
  }

}
