import { userSchema } from '../../db/zod'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { token } = query

  if (!token) {
    return sendRedirect(event, '/login?error=missing-params')
  }

  try {
    const result = await verifyOTPByToken(token as string)

    if (!result.success || !result.email) {
      return sendRedirect(event, '/login?error=invalid-otp')
    }

    const { user, isNewUser } = await handleEmailUser(result.email, event)

    const session = {
      user: userSchema.parse(user),
      loggedInAt: new Date(),
    }

    await setUserSession(event, session)

    return sendRedirect(event, isNewUser ? '/onboarding' : '/')
  } catch (error) {
    console.error('OTP verification error:', error)
    return sendRedirect(event, '/login?error=otp-verification')
  }
})
