export default defineNuxtRouteMiddleware(async () => {
  await useUser();
  const user = useCurrentUser();
  if (user.value) return "/app/dashboard";
});
