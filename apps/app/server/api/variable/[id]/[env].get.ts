import { getVariablesByProjectId } from "~/server/app/variableService";
import { Environment } from "shelves-types";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  console.log("event", event.context.user);
  /*const authToken = getCookie(event, "authToken");
  if (!authToken) throw createError({ statusCode: 400, statusMessage: "Missing authToken" });
  const user = await getUserByAuthToken(authToken);
  if (!user) throw createError({ statusCode: 400, statusMessage: "User not found" });*/
  const id = getRouterParam(event, "id") as string;
  const env = getRouterParam(event, "env") as Environment;
  if (!id && !env) throw createError({ statusCode: 400, statusMessage: "Missing params" });
  return await getVariablesByProjectId(parseInt(id), env);
});
