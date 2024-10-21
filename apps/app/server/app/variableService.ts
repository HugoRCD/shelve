import type { Environment, User, Variable, VariablesCreateInput } from '@shelve/types'
import { unseal, seal } from '@shelve/crypto'

const varAssociation = {
  production: 'production',
  preview: 'preview',
  staging: 'preview',
  development: 'development',
  prod: 'production',
  dev: 'development',
}

const { encryptionKey } = useRuntimeConfig().private

function getEnvString(env: string) {
  return env.split('|').map((env) => varAssociation[env as Environment]).join('|')
}

async function encryptVariable(variables: VariablesCreateInput['variables'], autoUppercase?: boolean): Promise<VariablesCreateInput['variables']> {
  for (const variable of variables) {
    if (autoUppercase) variable.key = variable.key.toUpperCase()
    const encryptedValue = await seal(variable.value, encryptionKey)
    delete variable.index
    variable.environment = getEnvString(variable.environment)
    variable.value = encryptedValue
  }
  return variables
}

async function decryptVariable(variables: VariablesCreateInput['variables']): Promise<VariablesCreateInput['variables']> {
  for (const variable of variables) {
    const decryptedValue = await unseal(variable.value, encryptionKey)
    variable.environment = getEnvString(variable.environment)
    variable.value = decryptedValue
  }
  return variables
}

export async function upsertVariable(variablesCreateInput: VariablesCreateInput) {
  console.log('autoUppercase', variablesCreateInput.autoUppercase)
  const encryptedVariables = await encryptVariable(variablesCreateInput.variables, variablesCreateInput.autoUppercase)

  if (variablesCreateInput.variables.length === 1) { // use on main form variable/update
    const [variableCreateInput] = encryptedVariables
    if (!variableCreateInput) throw new Error('Invalid variable')
    return prisma.variables.upsert({
      where: { id: variableCreateInput.id || -1 },
      update: variableCreateInput,
      create: variableCreateInput,
    })
  } // use on edit form variable/update or with CLI push command
  const method = variablesCreateInput.method || 'merge'
  if (method === 'overwrite') {
    await prisma.variables.deleteMany({ where: {
      projectId: variablesCreateInput.projectId,
      environment: varAssociation[variablesCreateInput.environment]
    } })
    return prisma.variables.createMany({
      data: encryptedVariables,
      skipDuplicates: true,
    })
  }
  const existingVariables = await prisma.variables.findMany({
    where: {
      projectId: variablesCreateInput.projectId,
      key: {
        in: encryptedVariables.map(variable => variable.key)
      }
    },
    select: {
      id: true,
    }
  })
  for (const variable of encryptedVariables) {
    if (existingVariables.some(existingVariable => existingVariable.id === variable.id)) {
      await prisma.variables.update({
        where: { id: variable.id },
        data: variable,
      })
    }
    await prisma.variables.create({
      data: variable,
    })
  }
  return encryptedVariables
}

export async function getVariablesByProjectId(projectId: number, environment?: Environment): Promise<Variable[]> {
  const options = environment ? {
    projectId,
    environment: {
      contains: varAssociation[environment],
    }
  } : { projectId }
  const variables = await prisma.variables.findMany({ where: options, orderBy: { updatedAt: 'desc' } })
  return await decryptVariable(variables)
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
