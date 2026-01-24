export default defineEventHandler(async (event) => {
  if (!event.path?.startsWith('/api')) return

  if (event.path?.startsWith('/api/auth')) return

  // Web login
  const session = await getUserSession(event)
  if (session.user) return

  // CLI auth token
  const authToken = getCookie(event, 'authToken')
  if (!authToken) return

  try {
    const user = await getUserByAuthToken(authToken, event)
    await setUserSession(event, {
      user,
      loggedInAt: new Date(),
    })
  } catch {
    // Token invalid, continue without session
    // The route handler will throw 401 if auth is required
  }
})
