export default defineNuxtRouteMiddleware(async () => {
  const user = await useSession().refresh()
  if (user) return '/app/projects'
})
