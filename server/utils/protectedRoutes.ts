import { getUserByAuthToken } from "~/server/app/userService";
import { Role } from "~/types/User";
import { H3Event } from "h3";

export async function protectRoute(event: H3Event, protectedRoutes: string[], requiredRole: Role | null = null) {
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
        statusMessage: "unauthorized",
      }),
    );
  }

  const user = await getUserByAuthToken(authToken);
  if (!user) {
    return sendError(
      event,
      createError({
        statusCode: 401,
        statusMessage: "unauthorized",
      }),
    );
  }

  if (requiredRole && user.role !== requiredRole) {
    return sendError(
      event,
      createError({
        statusCode: 401,
        statusMessage: "insufficient permissions",
      }),
    );
  }

  return user;
}
