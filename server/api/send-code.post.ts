import { H3Event } from "h3";
import { createUser } from "~/server/app/userService";
import { Role } from "~/types/User";

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event);

  // await sendLoginCode(body.email, Math.floor(Math.random() * 10000));
  const user = await createUser(body.email);

  return {
    code: 200,
    body: {
      message: "Code sent",
      user,
    }
  }
});
