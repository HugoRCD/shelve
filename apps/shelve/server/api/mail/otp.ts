export default defineEventHandler(async (event) => {
  const { email, otp } = await readBody(event)
  const appUrl = getRequestHost(event)
  const redirectUrl = `${appUrl}/login?email=${encodeURIComponent(email)}&otp=${otp}`

  const emailService = new EmailService(event)
  await emailService.sendOtp(email, otp, redirectUrl)

  return {
    statusCode: 200,
    message: 'OTP email sent',
  }
})
