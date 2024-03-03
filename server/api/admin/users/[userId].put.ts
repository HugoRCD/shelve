import { updateRoleUser } from "~/server/app/userService";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  const params = event.context.params;
  const body = await readBody(event);
  const role = body.role;
  if (!params) throw createError({ statusCode: 400, statusMessage: "Missing params" });
  const userId = parseInt(params.userId);
  return await updateRoleUser(userId, role);
});
