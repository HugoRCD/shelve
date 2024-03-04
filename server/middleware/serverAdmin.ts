import { protectRoute } from "~/server/utils/protectedRoutes";
import { Role } from "~/types/User";
import { H3Event } from "h3";

export default eventHandler(async (event: H3Event) => {
  const isAllowed = await protectRoute(event, ["/api/admin"], Role.Admin);

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
