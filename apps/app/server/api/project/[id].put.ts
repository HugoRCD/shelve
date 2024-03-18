import { updateProject } from "~/server/app/projectService";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  const user = event.context.user;
  const id = getRouterParam(event, "id") as string;
  if (!id) throw createError({ statusCode: 400, statusMessage: "Missing params" });
  const projectUpdateInput = await readBody(event);
  delete projectUpdateInput.variables;
  await updateProject(projectUpdateInput, parseInt(id));
  return {
    statusCode: 200,
    message: "Project updated",
  };
});
