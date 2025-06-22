import { z } from 'zod'

const bodySchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export default defineEventHandler(async (event) => {
  try {
    const { email } = await readValidatedBody(event, bodySchema.parse)
    
    const otpCode = await generateOTPForEmail(email, event)

    const emailService = new EmailService(event)
    const redirectUrl = `${getRequestURL(event).origin}/auth/otp?email=${encodeURIComponent(email)}&otp=${otpCode}`
    
    await emailService.sendOtp(email, otpCode, redirectUrl)

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
