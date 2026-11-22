import { z } from 'zod'

const bodySchema = z.object({
  email: z.email('Please enter a valid email address'),
  code: z.string().min(6, 'OTP code must be 6 digits').max(6, 'OTP code must be 6 digits'),
})

export default defineEventHandler(async (event) => {
  await requireHuman()

  const { email, code } = await readValidatedBody(event, bodySchema.parse)

  const response = await useServerAuth().api.signInEmailOTP({
    body: { email, otp: code },
    headers: event.headers,
    asResponse: true,
  })
  if (!response.ok) throw createError({ statusCode: 400, statusMessage: 'Invalid or expired OTP code' })
  forwardAuthCookies(event, response.headers)

  const { user } = await response.json() as { user: { onboarding?: boolean } }
  return { success: true, message: 'Authentication successful', isNewUser: !user.onboarding }
})
