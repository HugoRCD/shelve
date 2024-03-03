import { createUser } from "~/server/app/userService";
import { UserCreateInput } from "~/types/User";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  const body = await readBody(event);
  const createUserInput: UserCreateInput = {
    username: body.username,
    password: body.password,
    email: body.email,
  };
  return await createUser(createUserInput);
});
