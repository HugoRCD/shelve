import { getUserByAuthToken } from "~/server/app/userService";
import { H3Event } from "h3";
import { getProjectById, upsertProject } from "~/server/app/projectService";
import { upsertVariable } from "~/server/app/variableService";

export default eventHandler(async (event: H3Event) => {
  const user = event.context.user;
  const variableCreateInput = await readBody(event);
  const project = await getProjectById(variableCreateInput.projectId);
  if (!project) throw createError({ statusCode: 400, statusMessage: "Project not found" });
  return await upsertVariable({ ...variableCreateInput, projectId: project.id });
});
