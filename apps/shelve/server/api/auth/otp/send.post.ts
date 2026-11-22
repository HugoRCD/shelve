import { z } from 'zod'

const bodySchema = z.object({
  // Lowercased like Better Auth stores it, so the quota and the code use the same email. 50 is `users.email`'s length.
  email: z.email('Please enter a valid email address').max(50, 'Email must be at most 50 characters').transform(email => email.toLowerCase()),
})

export default defineEventHandler(async (event) => {
  await requireHuman()

  const { email } = await readValidatedBody(event, bodySchema.parse)
  // Before any code is stored: no email goes out without a trusted link.
  const appOrigin = getAppOrigin(event)

  const rateLimit = await checkOTPRateLimit(email)
  if (!rateLimit.allowed) {
    throw createError({
      statusCode: 429,
      statusMessage: `Too many requests. Please try again in ${rateLimit.retryAfterMinutes} minutes.`,
    })
  }
  // Counted before delivery, as before Better Auth, so parallel requests can't all use the last slot while it sends.
  await recordOTPRequest(email)

  // Created here and sent by Shelve, so a delivery failure fails this request instead of being logged and dropped.
  const otp = await useServerAuth().api.createVerificationOTP({ body: { email, type: 'sign-in' } })
  await new EmailService(event).sendOtp(email, otp, `${appOrigin}/auth/otp?${new URLSearchParams({ email, otp })}`)

  return { success: true, message: 'OTP sent successfully' }
})
