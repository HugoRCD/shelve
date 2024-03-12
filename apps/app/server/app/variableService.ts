import { Environment, type VariablesCreateInput } from "shelves-types";
import prisma from "~/server/database/client";

export async function upsertVariable(variablesCreateInput: VariablesCreateInput) {
  if (variablesCreateInput.variables.length === 1) {
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
    return prisma.envVar.createMany({
      data: variablesCreateInput.variables,
      skipDuplicates: true,
    });
  }
}

export async function getVariablesByProjectId(projectId: number, environment?: Environment) {
  const options = environment ? { projectId, environment } : { projectId };
  return prisma.envVar.findMany({ where: options });
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
