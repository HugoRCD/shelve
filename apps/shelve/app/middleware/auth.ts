export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn, waitForSession } = useUserSession()
  await waitForSession()

  if (!loggedIn.value) {
    toast.error('You need to be logged in to access this page.')
    return navigateTo('/login')
  }
})
