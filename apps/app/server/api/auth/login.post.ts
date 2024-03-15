import { formatUser } from "~/server/database/client";
import { login } from "~/server/app/authService";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  const body = await readBody(event);
  const { user, authToken} = await login(body);
  setCookie(event, "authToken", authToken, {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  return formatUser(user);
});
