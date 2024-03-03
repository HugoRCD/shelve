import { createUser } from "~/server/app/userService";
import { UserCreateInput } from "~/types/User";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  const body = await readBody(event);
  return await createUser(body.email);
});
