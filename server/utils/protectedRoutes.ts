import { getUserByAuthToken } from "~/server/app/userService";
import { Role } from "~/types/User";
import { H3Event } from "h3";

export async function protectRoute(event: H3Event, allowedRoutes: string[], requiredRole: Role | null): Promise<boolean> {
  if (event.path === undefined || !allowedRoutes.some((route) => event.path?.startsWith(route))) {
    return true;
  } else {
    const authToken = getCookie(event, "authToken");
    if (!authToken) return false;
    const user = await getUserByAuthToken(authToken);
    if (!user) return false;
    if (requiredRole && user.role !== requiredRole) return false;
  }
  return true;
}
