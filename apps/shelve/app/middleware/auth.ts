export default defineNuxtRouteMiddleware(async (to, from) => {
  const { data: session } = await useAuth().useSession(useFetch)
  if (!session.value) {
    toast.error('You need to be logged in to access this page.')
    return navigateTo('/login')
  }
})
