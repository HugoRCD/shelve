import { Environment, User, Variable, type VariablesCreateInput } from '@shelve/types'
import { decrypt, encrypt } from '@shelve/utils'
import prisma from '~/server/database/client'

const varAssociation = {
  production: 'production',
  preview: 'preview',
  development: 'development',
  prod: 'production',
  dev: 'development',
}

function getEnvString(env: string) {
  return env.split('|').map((env) => varAssociation[env as Environment]).join('|')
}

export async function upsertVariable(variablesCreateInput: VariablesCreateInput) {
  const { secretEncryptionKey, secretEncryptionIterations } = useRuntimeConfig().private

  const encryptVariables = (variables: VariablesCreateInput['variables']) => {
    return variables.map((variable) => {
      const encryptedValue = encrypt(variable.value, secretEncryptionKey, parseInt(secretEncryptionIterations))
      variable.environment = getEnvString(variable.environment)

      const { index, ...rest } = variable
      return { ...rest, value: encryptedValue }
    })
  }

  const encryptedVariables = encryptVariables(variablesCreateInput.variables)

  if (variablesCreateInput.variables.length === 1) { // use on main form variable/update
    const variableCreateInput = encryptedVariables[0]
    return await prisma.variables.upsert({
      where: { id: variableCreateInput.id || -1 },
      update: variableCreateInput,
      create: variableCreateInput,
    })
  } // use on edit form variable/update or with CLI push command
  return await prisma.variables.createMany({
    data: encryptedVariables,
    skipDuplicates: true,
  })
}

export async function getVariablesByProjectId(projectId: number, environment?: Environment): Promise<Variable[]> {
  const runtimeConfig = useRuntimeConfig().private
  const options = environment ? {
    projectId,
    environment: {
      contains: varAssociation[environment],
    }
  } : { projectId }
  const variables = await prisma.variables.findMany({ where: options, orderBy: { updatedAt: 'desc' } })
  return variables.map((variable) => {
    const decryptedValue = decrypt(variable.value, runtimeConfig.secret_encryption_key, parseInt(runtimeConfig.secret_encryption_iterations))
    return {
      ...variable,
      value: decryptedValue,
    }
  })
}

export async function deleteVariable(id: number, environment: string): Promise<void> {
  const envs = environment.split('|').map((env) => decodeURIComponent(env))
  await prisma.variables.delete({
    where: {
      id,
      environment: {
        in: envs,
      },
    },
  })
}

export async function deleteVariables(variablesId: number[], user: User): Promise<void> {
  const variables = await prisma.variables.findMany({
    where: {
      id: {
        in: variablesId
      }
    },
    select: {
      id: true,
      project: {
        select: {
          ownerId: true
        }
      }
    }
  })
  if (!variables.every(variable => variable.project.ownerId === user.id)) {
    throw new Error('You do not have permission to delete these variables')
  }
  await prisma.variables.deleteMany({ where: { id: { in: variables.map(variable => variable.id) } } })
}
