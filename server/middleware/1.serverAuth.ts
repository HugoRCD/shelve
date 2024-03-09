import { protectRoute } from "~/server/utils/protectedRoutes";
import { H3Event } from "h3";

export default defineEventHandler(async (event: H3Event) => {
  const protectedRoutes = [
    "/api/user",
    "/api/project",
    "/api/variable",
    "/api/admin"
  ];

  const user = await protectRoute(event, protectedRoutes);

  event.context.user = user;
});
