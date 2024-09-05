export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession()

  if (!loggedIn.value) {
    toast.error('You need to be logged in to access this page.')
    return navigateTo('/login')
  }
})
