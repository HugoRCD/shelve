import type { User } from "~/types/User";
import { Role } from "~/types/User";

export const useCurrentUser = () => {
  return useState<User | null>("user", () => null);
};

export const isLoggedIn = computed(() => {
  return !!useCurrentUser().value;
});

export const isAdmin = computed(() => {
  return useCurrentUser().value?.role === Role.Admin;
});

export async function useUser(): Promise<User | null> {
  const authCookie = useCookie("authToken");
  const user = useCurrentUser().value;

  if (authCookie && !user) {
    const cookieHeaders = useRequestHeaders(["cookie"]);
    const response = await $fetch<User>("/api/auth/currentUser", {
      method: "GET",
      headers: cookieHeaders as HeadersInit,
    });
    if (!response) {
      return null;
    }
    useCurrentUser().value = response;
  }
  return user;
}
