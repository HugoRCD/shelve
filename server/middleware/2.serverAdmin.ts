import { protectRoute } from "~/server/utils/protectedRoutes";
import { Role } from "~/types/User";
import { H3Event } from "h3";

export default defineEventHandler(async (event: H3Event) => {
  const protectedRoutes = [
    "/api/admin"
  ];

  const user = await protectRoute(event, protectedRoutes, Role.Admin);

  event.context.user = user;
});
