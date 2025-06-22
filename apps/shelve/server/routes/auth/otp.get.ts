import { verifyOTPForUser } from '../../services/otp'
import { userSchema } from '../../database/zod'

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

    const session = {
      user: userSchema.parse(result.user),
      loggedInAt: new Date(),
    }

    await setUserSession(event, session)

    return sendRedirect(event, result.user!.onboarding ? '/' : '/onboarding')
  } catch (error) {
    console.error('OTP verification error:', error)
    return sendRedirect(event, `/login?error=otp-verification&email=${encodeURIComponent(email as string)}`)
  }
})
