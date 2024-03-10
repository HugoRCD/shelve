import { deleteUser } from "~/server/app/userService";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  const user = event.context.user;
  await deleteUser(user.id);
  return {
    statusCode: 200,
    message: "User deleted",
  };
});
