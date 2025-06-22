import { z } from 'zod'
import { verifyOTPForUser } from '../../../services/otp'

const bodySchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  code: z.string().min(6, 'OTP code must be 6 digits').max(6, 'OTP code must be 6 digits'),
})

export default defineEventHandler(async (event) => {
  try {
    const { email, code } = await readValidatedBody(event, bodySchema.parse)

    const { success, user, message } = await verifyOTPForUser(email, code)

    if (!success) {
      throw createError({
        statusCode: 400,
        statusMessage: message,
      })
    }

    const session = {
      user,
      loggedInAt: new Date(),
    }

    await setUserSession(event, session)

    return {
      success: true,
      message: 'Authentication successful',
      user,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Authentication failed',
    })
  }
}) 
