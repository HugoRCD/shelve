import prisma from "~/server/database/client";
import { VariableCreateInput } from "~/types/Variables";

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

export async function getVariablesByProjectId(projectId: number) {
  return prisma.envVar.findMany({
    where: {
      projectId,
    },
  });
}

export async function deleteVariable(id: number) {
  return prisma.envVar.delete({
    where: {
      id,
    },
  });
}
