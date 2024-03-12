import { getProjectById } from "~/server/app/projectService";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  const user = event.context.user;
  const id = getRouterParam(event, "id") as string;
  if (!id) throw createError({ statusCode: 400, statusMessage: "Missing params" });
  return await getProjectById(parseInt(id));
});
