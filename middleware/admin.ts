export default defineNuxtRouteMiddleware(async () => {
  if (!isAdmin.value) {
    toast.error("You need to be an admin to access this page.");
    return "/app/dashboard";
  }
});
