import prisma from "~/server/database/client";
import { Environment, VariableCreateInput } from "~/types/Variables";

export async function upsertVariable(project: VariableCreateInput) {
  return prisma.envVar.upsert({
    where: {
      id: project.projectId,
    },
    update: project,
    create: project,
  });
}

export async function getVariableById(id: number) {
  return prisma.envVar.findUnique({
    where: {
      id,
    },
  });
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
