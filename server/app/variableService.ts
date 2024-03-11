import { Environment, VariablesCreateInput } from "~/types/Variables";
import prisma from "~/server/database/client";

export async function upsertVariable(variablesCreateInput: VariablesCreateInput) {
  console.log(variablesCreateInput);
  if (variablesCreateInput.variables.length === 1) {
    const variableCreateInput = variablesCreateInput.variables[0];
    return prisma.envVar.upsert({
      where: {
        id: variableCreateInput.id,
      },
      update: variableCreateInput,
      create: variableCreateInput,
    });
  } else {
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

export async function deleteVariable(id: number, environment: Environment) {
  return prisma.envVar.delete({
    where: {
      id,
      environment,
    },
  });
}
