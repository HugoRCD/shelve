export default defineEventHandler(async (event) => {
  if (!event.path?.startsWith('/api')) return
  if (event.path?.startsWith('/api/auth')) return

  const session = await getUserSession(event)
  if (session.user) return

  const authHeader = getRequestHeader(event, 'authorization')
  let bearer: string | undefined
  if (authHeader?.toLowerCase().startsWith('bearer ')) {
    bearer = authHeader.slice(7).trim()
  }

  let legacyCookie = false
  if (!bearer) {
    const cookieToken = getCookie(event, 'authToken')
    if (cookieToken) {
      bearer = cookieToken
      legacyCookie = true
    }
  }

  if (!bearer) return

  try {
    const { user, scopes } = await authenticateToken(bearer, event)
    await setUserSession(event, {
      user,
      tokenScopes: scopes,
      loggedInAt: new Date(),
    })
    if (legacyCookie) {
      setResponseHeader(event, 'Deprecation', 'true')
      setResponseHeader(event, 'Sunset', 'Wed, 01 Jul 2026 00:00:00 GMT')
      setResponseHeader(event, 'Link', '</docs/cli/auth>; rel="deprecation"')
    }
  } catch {
    // Token invalid, continue without session.
    // The route handler will throw 401 if auth is required.
  }
})
