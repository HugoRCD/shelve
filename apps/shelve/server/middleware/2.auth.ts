import type { H3Event } from 'h3'

/** API tokens only reach the team API and `GET /api/user/me`. Account, token and admin routes need a web session. */
function acceptsTokens(event: H3Event): boolean {
  const { pathname } = getRequestURL(event)
  if (pathname === '/api/user/me' || pathname === '/api/teams') return event.method === 'GET'
  return pathname.startsWith('/api/teams/')
}

export default defineEventHandler(async (event) => {
  if (!event.path?.startsWith('/api')) return

  const session = await getUserSession(event)
  // A token session is only valid for the request that sent the token. One coming back in
  // a cookie or session header would outlive the token's revocation, expiry and IP allowlist.
  if (session.tokenScopes) {
    await clearUserSession(event)
    throw createError({ statusCode: 401, statusMessage: 'Invalid session' })
  }
  if (session.user) return
  if (event.path.startsWith('/api/auth')) return

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

  if (!acceptsTokens(event)) {
    throw createError({ statusCode: 403, statusMessage: 'API tokens cannot be used on this endpoint' })
  }

  let auth: Awaited<ReturnType<typeof authenticateToken>>
  try {
    auth = await authenticateToken(bearer, event)
  } catch {
    // Token invalid, continue without session.
    // The route handler will throw 401 if auth is required.
    return
  }

  const { user, scopes, token } = auth
  await setUserSession(event, {
    user,
    tokenScopes: scopes,
    tokenId: token.id,
    tokenPrefix: token.prefix,
    tokenName: token.name,
    loggedInAt: new Date(),
  }, { cookie: false })
  if (legacyCookie) {
    setResponseHeader(event, 'Deprecation', 'true')
    setResponseHeader(event, 'Sunset', 'Wed, 01 Jul 2026 00:00:00 GMT')
    setResponseHeader(event, 'Link', '</docs/cli/auth>; rel="deprecation"')
  }

  await requireTokenScope(event, { permission: getRequestPermission(event) })
})
