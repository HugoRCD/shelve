function setAuthRedirectCookie(event: H3Event, redirect: string | undefined) {
  const path = getSafeRedirectPath(redirect)
  if (!path) return
  setCookie(event, 'auth_redirect', path, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  })
}

export default defineEventHandler((event) => {
  const { path } = event
  const query = getQuery(event)
  const redirect = query.redirect as string | undefined

  if (path.startsWith('/auth/github') || path.startsWith('/auth/google')) {
    setAuthRedirectCookie(event, redirect)
    return
  }

  if (path === '/login' && redirect) {
    setAuthRedirectCookie(event, redirect)
  }
})
