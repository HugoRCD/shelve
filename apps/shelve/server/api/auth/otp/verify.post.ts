import { checkBotId } from 'botid/server'
import { z } from 'zod'
import { userSchema } from '../../../database/zod'

const bodySchema = z.object({
  email: z.email('Please enter a valid email address'),
  code: z.string().min(6, 'OTP code must be 6 digits').max(6, 'OTP code must be 6 digits'),
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
    const { email, code } = await readValidatedBody(event, bodySchema.parse)

    const result = await verifyOTPForUser(email, code)

    if (!result.success) {
      throw createError({
        statusCode: 400,
        statusMessage: result.message,
      })
    }

    const { user, isNewUser } = await handleEmailUser(email, event)

    const session = {
      user: userSchema.parse(user),
      loggedInAt: new Date(),
    }

    await setUserSession(event, session)

    return {
      success: true,
      message: 'Authentication successful',
      user: session.user,
      isNewUser,
    }
  } catch (error: any) {
    console.error('OTP verification error:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Authentication failed',
    })
  }
})
