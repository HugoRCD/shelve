export default defineNuxtRouteMiddleware(async () => {
  await useUser();
  const user = useCurrentUser();
  if (!user.value) {
    toast.error("You need to be logged in to access this page.");
    return "/login";
  }
});
