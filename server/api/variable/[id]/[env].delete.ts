import { deleteUser, getUserByAuthToken } from "~/server/app/userService";
import { H3Event } from "h3";
import { deleteVariable } from "~/server/app/variableService";
import { Environment } from "~/types/Variables";

export default eventHandler(async (event: H3Event) => {
  const authToken = getCookie(event, "authToken");
  if (!authToken) throw createError({ statusCode: 400, statusMessage: "Missing authToken" });
  const user = await getUserByAuthToken(authToken);
  if (!user) throw createError({ statusCode: 400, statusMessage: "User not found" });
  const id = getRouterParam(event, "id") as string;
  const env = getRouterParam(event, "env") as Environment;
  if (!id && !env) throw createError({ statusCode: 400, statusMessage: "Missing params" });
  await deleteVariable(parseInt(id), env);
  return {
    statusCode: 200,
    message: "User deleted",
  };
});
