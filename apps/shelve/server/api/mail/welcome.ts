import { EmailService } from '~~/server/services/resend'

export default defineEventHandler(async (event) => {
  const { email, username } = await readBody(event)
  const appUrl= getRequestHost(event)
  const emailService = new EmailService()
  await emailService.sendWelcomeEmail(email, username, appUrl)
  return {
    statusCode: 200,
    message: 'Email sent',
  }
})
