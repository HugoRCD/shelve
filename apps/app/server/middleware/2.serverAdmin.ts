import { Role } from "@shelve/types";
import { H3Event } from "h3";

export default defineEventHandler(async (event: H3Event) => {
  const protectedRoutes = [
    "/api/admin"
  ];

  const user = event.context.user;

  if (protectedRoutes.some((route) => event.path?.startsWith(route)) && (!user || user.role !== Role.Admin)) {
    return sendError(
      event,
      createError({
        statusCode: 401,
        statusMessage: "insufficient permissions",
      }),
    );
  }
});
