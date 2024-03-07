import { getUserByAuthToken } from "~/server/app/userService";
import { H3Event } from "h3";
import { upsertProject } from "~/server/app/projectService";

export default eventHandler(async (event: H3Event) => {
  const authToken = getCookie(event, "authToken");
  if (!authToken) throw createError({ statusCode: 400, statusMessage: "you are not logged in" });
  const user = await getUserByAuthToken(authToken);
  if (!user) throw createError({ statusCode: 400, statusMessage: "User not found" });
  const projectCreateInput = await readBody(event);
  return await upsertProject({ ...projectCreateInput, ownerId: user.id });
});
