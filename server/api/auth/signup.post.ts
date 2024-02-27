/*
import { createUser } from "~/server/app/userService";
import { CreateUserDto } from "~/types/User";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  const body = await readBody(event);
  const createUserInput: CreateUserDto = {
    username: body.username,
    password: body.password,
    avatar: body.avatar || "",
    email: body.email,
  };
  return await createUser(createUserInput);
});
*/
