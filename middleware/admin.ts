export default defineNuxtRouteMiddleware(async () => {
  const { refresh, isAdmin } = useSession();
  await refresh();
  if (!isAdmin) {
    toast.error("You need to be an admin to access this page.");
    return "/app/dashboard";
  }
});
