import { getUserByAuthToken } from "~/server/app/userService";
import { Role } from "~/types/User";
import { H3Event } from "h3";

export async function protectRoute(event: H3Event, allowedRoutes: string[], requiredRole: Role | null): Promise<{
  isAllowed: boolean;
  user: null | { id: number; email: string; role: Role };
}> {
  const isAllowed = false;
  const user = null;

  if (event.path === undefined || !allowedRoutes.some((route) => event.path?.startsWith(route))) {
    return { isAllowed: true, user };
  } else {
    const authToken = getCookie(event, "authToken");
    if (!authToken) return { isAllowed: false, user: null };

    const user = await getUserByAuthToken(authToken);
    if (!user) return { isAllowed: false, user: null };

    if (user.role === Role.Admin) return { isAllowed: true, user };

    if (requiredRole && user.role !== requiredRole) return { isAllowed: false, user: null };
  }

  return { isAllowed: true, user };
}
