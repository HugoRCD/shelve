import { H3Event } from "h3";
import { deleteUser } from "~/server/app/userService";

export default eventHandler(async (event: H3Event) => {
  const params = event.context.params;
  if (!params) throw createError({ statusCode: 400, statusMessage: "Missing params" });
  const userId = parseInt(params.userId);
  await deleteUser(userId);
  return {
    statusCode: 200,
    message: "User deleted",
  };
});
