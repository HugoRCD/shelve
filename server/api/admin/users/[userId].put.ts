import { updateRoleUser } from "~/server/app/userService";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  const body = await readBody(event);
  const id = getRouterParam(event, "id") as string;
  if (!id) throw createError({ statusCode: 400, statusMessage: "missing params" });
  await updateRoleUser(parseInt(id), body.role);
  return {
    statusCode: 200,
    message: "user updated",
  };
});
