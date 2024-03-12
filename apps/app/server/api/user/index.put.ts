import { updateUser } from "~/server/app/userService";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  const user = event.context.user;
  const updateUserInput = await readBody(event);
  return await updateUser(user, updateUserInput);
});
