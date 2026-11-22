import { z } from 'zod'

const bodySchema = z.object({
  email: z.email('Please enter a valid email address'),
})

export default defineEventHandler(async (event) => {
  try {
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

    const { code, token } = await generateOTPForEmail(email, event)

    const emailService = new EmailService(event)
    const redirectUrl = `${appOrigin}/auth/otp?token=${token}`

    await emailService.sendOtp(email, code, redirectUrl)

    return {
      success: true,
      message: 'OTP sent successfully',
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send OTP',
    })
  }
})
