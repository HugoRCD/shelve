export default defineEventHandler((event) => {
  const { path } = event

  // Only handle OAuth routes
  if (path.startsWith('/auth/github') || path.startsWith('/auth/google')) {
    const query = getQuery(event)
    const redirect = query.redirect as string | undefined

    if (redirect) {
      // Validate redirect URL - only allow internal paths
      if (redirect.startsWith('/') && !redirect.startsWith('//')) {
        setCookie(event, 'auth_redirect', redirect, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 10, // 10 minutes
          path: '/',
        })
      }
    }
  }
})
