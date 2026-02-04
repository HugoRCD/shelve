import { checkBotId } from 'botid/server'
import { z } from 'zod'

const bodySchema = z.object({
  email: z.email('Please enter a valid email address'),
})

export default defineEventHandler(async (event) => {
  try {
    const verification = await checkBotId()

    if (verification.isBot) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied',
      })
    }
    const { email } = await readValidatedBody(event, bodySchema.parse)

    const rateLimit = await checkOTPRateLimit(email)
    if (!rateLimit.allowed) {
      throw createError({
        statusCode: 429,
        statusMessage: `Too many requests. Please try again in ${rateLimit.retryAfterMinutes} minutes.`,
      })
    }

    const { code, token } = await generateOTPForEmail(email, event)

    const emailService = new EmailService(event)
    const redirectUrl = `${getRequestURL(event).origin}/auth/otp?token=${token}`

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
