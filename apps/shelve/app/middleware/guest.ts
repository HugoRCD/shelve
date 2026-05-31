export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  if (!loggedIn.value) return

  const redirect = to.query.redirect as string | undefined
  if (redirect?.startsWith('/') && !redirect.startsWith('//')) {
    return navigateTo(redirect)
  }

  return navigateTo('/')
})
