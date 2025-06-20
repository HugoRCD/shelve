export default defineEventHandler(async (event) => {
  const protectedRoutes = [
    '/api/user',
    '/api/teams',
    '/api/environments',
    '/api/tokens',
    '/api/admin',
    '/api/protected',
  ]

  if (!protectedRoutes.some((route) => event.path?.startsWith(route))) return

  const authToken = getCookie(event, 'authToken')

  if (authToken) {
    const user = await getUserByAuthToken(authToken, event)
    await setUserSession(event, {
      user,
      loggedInAt: new Date(),
    })
  }
})
