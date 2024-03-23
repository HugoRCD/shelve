import { removeTeamFromProject } from "~/server/app/projectService";
import { H3Event } from "h3";

export default defineEventHandler(async (event: H3Event) => {
  const id = getRouterParam(event, "id") as string;
  const teamId = getRouterParam(event, "teamId") as string;
  if (!id || !teamId) throw createError({ statusCode: 400, statusMessage: "Missing params" });
  await removeTeamFromProject(+id,+teamId);
});
