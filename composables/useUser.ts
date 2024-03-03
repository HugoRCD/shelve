import type { publicUser } from "~/types/User";
import { Role } from "~/types/User";

export const useCurrentUser = () => {
  return useState<publicUser | null>("user", () => null);
};

export const isLoggedIn = computed(() => {
  return !!useCurrentUser().value;
});

export const isAdmin = computed(() => {
  return useCurrentUser().value?.role === Role.Admin;
});

export async function useUser(): Promise<publicUser | null> {
  const authCookie = useCookie("authToken");
  const user = useCurrentUser().value;

  if (authCookie && !user) {
    const cookieHeaders = useRequestHeaders(["cookie"]);
    const response = await $fetch<publicUser>("/api/auth/currentUser", {
      method: "GET",
      headers: cookieHeaders as HeadersInit,
    });
    if (!response) return null;
    useCurrentUser().value = response;
  }
  return user;
}

export async function logout() {
  const user = useCurrentUser().value;
  toast.message("See you soon, " + user!.username);
  useCurrentUser().value = null;
  await $fetch("/api/auth/logout", { method: "POST" });
  await useRouter().push("/login");
}
