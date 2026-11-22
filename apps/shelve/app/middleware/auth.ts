export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useAuth()

  if (!loggedIn.value) {
    toast.error('You need to be logged in to access this page.')
    return navigateTo('/login')
  }
})
