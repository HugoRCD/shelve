import type { H3Event } from 'h3'

/** API tokens only reach the team API and `GET /api/user/me`. Account, token and admin routes need a web session. */
function acceptsTokens(event: H3Event): boolean {
  // Check the path the router matches: decoded and cut at the first `?`, so encoded characters can't point it elsewhere.
  const path = event.path.split('?')[0]!.replace(/\/+$/, '')
  if (path.includes('\\') || path.split('/').some(segment => segment === '.' || segment === '..')) return false
  if (path === '/api/user/me' || path === '/api/teams') return event.method === 'GET'
  return path.startsWith('/api/teams/')
}

export default defineEventHandler(async (event) => {
  if (!event.path?.startsWith('/api')) return
  if (event.path.startsWith('/api/auth')) return
  if (await getAuth(event)) return

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
  // Kept on the request only: a token's access must not outlive its revocation, expiry and IP allowlist.
  event.context.auth = { user, token: { ...token, scopes } }
  if (legacyCookie) {
    setResponseHeader(event, 'Deprecation', 'true')
    setResponseHeader(event, 'Sunset', 'Wed, 01 Jul 2026 00:00:00 GMT')
    setResponseHeader(event, 'Link', '</docs/cli/auth>; rel="deprecation"')
  }

  await requireTokenScope(event, { permission: getRequestPermission(event) })
})
