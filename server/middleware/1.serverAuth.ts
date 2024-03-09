import { getUserByAuthToken } from "~/server/app/userService";
import { Role } from "~/types/User";
import { H3Event } from "h3";

export default defineEventHandler(async (event: H3Event) => {
  const protectedRoutes = ["/api/user", "/api/project", "/api/variable", "/api/admin"];
  const askedRoute = event.path;

  if (!protectedRoutes.some((route) => askedRoute?.startsWith(route))) {
    return;
  }

  const authToken = getCookie(event, "authToken");
  if (!authToken) {
    return sendError(
      event,
      createError({
        statusCode: 401,
        statusMessage: "Unauthorized, please login",
      }),
    );
  }

  const user = await getUserByAuthToken(authToken);
  if (!user) {
    return sendError(
      event,
      createError({
        statusCode: 401,
        statusMessage: "Unauthorized, please login",
      }),
    );
  }

  event.context.user = user;
});
