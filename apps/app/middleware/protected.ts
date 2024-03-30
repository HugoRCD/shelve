export default defineNuxtRouteMiddleware(async () => {
  const user = await useSession().refresh()
  if (!user) {
    toast.error('You need to be logged in to access this page.')
    return '/login'
  }
})
