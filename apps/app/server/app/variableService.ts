import { Environment, type VariablesCreateInput } from "@shelve/types";
import prisma from "~/server/database/client";
import { decrypt, encrypt } from "@shelve/utils";


export async function upsertVariable(variablesCreateInput: VariablesCreateInput) {
  const runtimeConfig = useRuntimeConfig().private;
  if (variablesCreateInput.variables.length === 1) {
    variablesCreateInput.variables = variablesCreateInput.variables.map((variable) => {
      const encryptedValue = encrypt(variable.value, runtimeConfig.secret_encryption_key, parseInt(runtimeConfig.secret_encryption_iterations));
      const { index, ...rest} = variable;
      rest.value = encryptedValue;
      return rest;
    });
    variablesCreateInput.variables = variablesCreateInput.variables.map((variable) => {
      const { index, ...rest } = variable;
      return rest;
    });
    const variableCreateInput = variablesCreateInput.variables[0];
    return prisma.envVar.upsert({
      where: {
        id: variableCreateInput.id || -1,
      },
      update: variableCreateInput,
      create: variableCreateInput,
    });
  } else {
    variablesCreateInput.variables = variablesCreateInput.variables.map((variable) => {
      const { index, ...rest } = variable;
      return rest;
    });
    /*variablesCreateInput.variables = variablesCreateInput.variables.map((variable) => {
      const encryptedValue = encrypt(variable.value, runtimeConfig.secret_encryption_key, parseInt(runtimeConfig.secret_encryption_iterations));
      const { index, ...rest } = variable;
      rest.value = encryptedValue;
      return rest;
    });*/
    return prisma.envVar.createMany({
      data: variablesCreateInput.variables,
      skipDuplicates: true,
    });
  }
}

export async function getVariablesByProjectId(projectId: number, environment?: Environment) {
  const options = environment ? {
    projectId,
    environment: {
      contains: environment,
    }
  } : { projectId };
  /*const variables = await prisma.envVar.findMany({ where: options, orderBy: { updatedAt: "desc" } });
  return variables.map((variable) => {
    const decryptedValue = decrypt(variable.value, runtimeConfig.secret_encryption_key, parseInt(runtimeConfig.secret_encryption_iterations));
    return {
      ...variable,
      value: decryptedValue,
    };
  });*/
  return prisma.envVar.findMany({ where: options, orderBy: { updatedAt: "desc" } });
}

export async function deleteVariable(id: number, environment: string) {
  // decode environment to utf-8
  const envs = environment.split("|").map((env) => decodeURIComponent(env));
  return prisma.envVar.delete({
    where: {
      id,
      environment: {
        in: envs,
      },
    },
  });
}
