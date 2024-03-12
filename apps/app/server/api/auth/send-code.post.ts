import { upsertUser } from "~/server/app/userService";
import type { UserCreateInput } from "~/types/User";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  const body = await readBody(event) as UserCreateInput;
  return await upsertUser(body);
});
