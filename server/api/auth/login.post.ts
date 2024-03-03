import { formatUser } from "~/server/database/client";
import { login } from "~/server/app/authService";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  const body = await readBody(event);
  const user = await login(body.username, body.password);
  setCookie(event, "authToken", user.authToken as string, {
    httpOnly: true,
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  return formatUser(user);
});
