import { type publicUser, Role } from "@shelve/types";

export const useCurrentUser = () => {
  return useState<publicUser | null>("user");
};

export const useSession = () => {
  const authCookie = useCookie('authToken');
  const user = useState<publicUser>("user");

  async function refresh() {
    if (authCookie && !user.value) {
      const cookieHeaders = useRequestHeaders(["cookie"]);
      const response = await $fetch<publicUser>("/api/auth/currentUser", {
        method: "GET",
        headers: cookieHeaders as HeadersInit,
      });
      user.value = response;
    }
    return user.value;
  }

  async function clear() {
    toast.message("See you soon, " + user.value.username || user.value.email);
    useCurrentUser().value = null;
    await useRouter().push("/login");
    await $fetch("/api/auth/logout", { method: "POST" });
  }

  const isLoggedIn = computed(() => {
    return !!useCurrentUser().value;
  });

  const isAdmin = computed(() => {
    return useCurrentUser().value?.role === Role.Admin;
  });

  return {
    user,
    refresh,
    clear,
    isLoggedIn,
    isAdmin
  };
}
