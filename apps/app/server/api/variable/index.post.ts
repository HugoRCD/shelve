import { upsertVariable } from "~/server/app/variableService";
import { getProjectById } from "~/server/app/projectService";
import { H3Event } from "h3";
import { type VariablesCreateInput } from "~/types/Variables";

export default eventHandler(async (event: H3Event) => {
  const user = event.context.user;
  const variablesCreateInput = await readBody(event) as VariablesCreateInput;
  const project = await getProjectById(variablesCreateInput.projectId);
  if (!project) throw createError({ statusCode: 400, statusMessage: "Project not found" });
  return await upsertVariable(variablesCreateInput);
});
