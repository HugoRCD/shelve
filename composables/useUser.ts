import type { publicUser } from "~/types/User";
import { Role } from "~/types/User";


export const isLoggedIn = computed(() => {
  return !!useCurrentUser().value;
});

export const isAdmin = computed(() => {
  return useCurrentUser().value?.role === Role.Admin;
});

export async function useUser(): Promise<publicUser | null> {
  const authCookie = useCookie('authToken');
  const user = useState<publicUser | null>("user");

  if (authCookie && !user.value) {
    const cookieHeaders = useRequestHeaders(["cookie"]);
    const { data } = await useFetch<publicUser>("/api/auth/currentUser", {
      method: "GET",
      headers: cookieHeaders as HeadersInit,
    });
    user.value = data.value;
  }
  return user.value;
}

export async function logout() {
  const user = useState<publicUser | null>("user");
  toast.message("See you soon, " + user.value?.username);
  useState<publicUser | null>("user").value = null;
  await $fetch("/api/auth/logout", { method: "POST" });
  await useRouter().push("/login");
}
