export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn, waitForSession } = useUserSession()
  await waitForSession()

  if (loggedIn.value) {
    return navigateTo('/')
  }
})
