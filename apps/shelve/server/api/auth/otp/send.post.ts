import { z } from 'zod'

const bodySchema = z.object({
  email: z.email('Please enter a valid email address'),
})

export default defineEventHandler(async (event) => {
  await requireHuman()

  const { email } = await readValidatedBody(event, bodySchema.parse)

  const rateLimit = await checkOTPRateLimit(email)
  if (!rateLimit.allowed) {
    throw createError({
      statusCode: 429,
      statusMessage: `Too many requests. Please try again in ${rateLimit.retryAfterMinutes} minutes.`,
    })
  }

  await useServerAuth().api.sendVerificationOTP({ body: { email, type: 'sign-in' }, headers: event.headers })
  await recordOTPRequest(email)

  return { success: true, message: 'OTP sent successfully' }
})
