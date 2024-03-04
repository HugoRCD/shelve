import { deleteUser, getUserByAuthToken } from "~/server/app/userService";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  const authToken = getCookie(event, "authToken");
  if (!authToken) throw createError({ statusCode: 400, statusMessage: "Missing authToken" });
  const user = await getUserByAuthToken(authToken);
  if (!user) throw createError({ statusCode: 400, statusMessage: "User not found" });
  await deleteUser(user.id);
  return {
    statusCode: 200,
    message: "User deleted",
  };
});
