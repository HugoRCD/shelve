/** The link in the sign-in email: it carries the same code as the email, so it signs in like `/api/auth/otp/verify`. */
export default defineEventHandler(async (event) => {
  const { email, otp } = getQuery(event)
  if (typeof email !== 'string' || typeof otp !== 'string') return sendRedirect(event, '/login?error=missing-params')

  const response = await useServerAuth().api.signInEmailOTP({
    body: { email, otp },
    headers: event.headers,
    asResponse: true,
  }).catch((error: unknown) => {
    console.error('[Auth] Email link sign-in failed:', error)
    return null
  })
  if (!response) return sendRedirect(event, '/login?error=otp-verification')
  if (!response.ok) return sendRedirect(event, '/login?error=invalid-otp')
  forwardAuthCookies(event, response.headers)

  const { user } = await response.json() as { user: { onboarding?: boolean } }
  return sendRedirect(event, user.onboarding ? '/' : '/onboarding')
})
