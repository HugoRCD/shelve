import { userSchema } from '../../db/zod'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { email, otp } = query

  if (!email || !otp) {
    return sendRedirect(event, '/login?error=missing-params')
  }

  try {
    const result = await verifyOTPForUser(email as string, otp as string)

    if (!result.success) {
      return sendRedirect(event, `/login?error=invalid-otp&email=${encodeURIComponent(email as string)}`)
    }

    const { user, isNewUser } = await handleEmailUser(email as string, event)

    const session = {
      user: userSchema.parse(user),
      loggedInAt: new Date(),
    }

    await setUserSession(event, session)

    return sendRedirect(event, isNewUser ? '/onboarding' : '/')
  } catch (error) {
    console.error('OTP verification error:', error)
    return sendRedirect(event, `/login?error=otp-verification&email=${encodeURIComponent(email as string)}`)
  }
})
