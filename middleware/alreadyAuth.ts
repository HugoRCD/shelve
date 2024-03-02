export default defineNuxtRouteMiddleware(async () => {
  const user = useCurrentUser();
  if (user.value) return "/app/dashboard";
});
