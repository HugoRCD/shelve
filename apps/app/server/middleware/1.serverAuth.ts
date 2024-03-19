import { getUserByAuthToken } from "~/server/app/userService";
import { H3Event } from "h3";

export default defineEventHandler(async (event: H3Event) => {
  const protectedRoutes = [
    "/api/auth/logout",
    "/api/user",
    "/api/team",
    "/api/project",
    "/api/variable",
    "/api/admin"
  ];

  if (!protectedRoutes.some((route) => event.path?.startsWith(route))) {
    return;
  }

  const authToken = getCookie(event, "authToken");
  if (!authToken) {
    return sendError(
      event,
      createError({
        statusCode: 401,
        statusMessage: "unauthorized",
      }),
    );
  }
  event.context.authToken = authToken;

  const user = event.context.user || (await getUserByAuthToken(authToken));
  if (!user) {
    return sendError(
      event,
      createError({
        statusCode: 401,
        statusMessage: "unauthorized",
      }),
    );
  }

  event.context.user = user;
});
