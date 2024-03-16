import { deleteVariable } from "~/server/app/variableService";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  const user = event.context.user;
  const authToken = event.context.authToken;
  const id = getRouterParam(event, "id") as string;
  const env = getRouterParam(event, "env") as string;
  if (!id && !env) throw createError({ statusCode: 400, statusMessage: "Missing params" });
  await deleteVariable(parseInt(id), env);
  return {
    statusCode: 200,
    message: "User deleted",
  };
});
