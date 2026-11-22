import type { H3Event } from 'h3'

/** API keys only reach the team API and `GET /api/user/me`. Account, API key and admin routes need a web session. */
function acceptsApiKeys(event: H3Event): boolean {
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

  if (!acceptsApiKeys(event)) {
    throw createError({ statusCode: 403, statusMessage: 'API tokens cannot be used on this endpoint' })
  }

  let auth: Awaited<ReturnType<typeof authenticateApiKey>>
  try {
    auth = await authenticateApiKey(bearer, event)
  } catch {
    // Invalid key, continue without session.
    // The route handler will throw 401 if auth is required.
    return
  }

  // Kept on the request only: an API key's access must not outlive its revocation, expiry and IP allowlist.
  event.context.auth = auth
  if (legacyCookie) {
    setResponseHeader(event, 'Deprecation', 'true')
    setResponseHeader(event, 'Sunset', 'Wed, 01 Jul 2026 00:00:00 GMT')
    setResponseHeader(event, 'Link', '</docs/cli/auth>; rel="deprecation"')
  }

  await requireApiKeyScope(event, { permission: getRequestPermission(event) })
})
