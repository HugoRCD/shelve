import { getUserByAuthToken } from "~/server/app/userService";
import { Role } from "~/types/User";
import { H3Event } from "h3";

export default eventHandler(async (event) => {
  const isAllowed = await protectAdminRoute(event);

  if (!isAllowed) {
    return sendError(
      event,
      createError({
        statusCode: 401,
        statusMessage: "Insufficient permissions",
      }),
    );
  }
});

async function protectAdminRoute(event: H3Event): Promise<boolean> {
  const protectedRoutes = ["/api/admin"];

  if (event.path === undefined || !protectedRoutes.some((route) => event.path?.startsWith(route))) {
    return true;
  } else {
    const authToken = getCookie(event, "authToken");
    if (!authToken) return false;
    const user = await getUserByAuthToken(authToken);
    if (!user) return false;
    return user.role === Role.Admin;
  }
}
