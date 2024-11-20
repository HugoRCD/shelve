// import { EmailService } from '~~/server/services/resend.service'

export default defineEventHandler((event) => {
  /*const { email, username } = await readBody(event)
  const emailService = new EmailService()
  await emailService.sendWelcomeEmail(email, username)*/
  return {
    statusCode: 200,
    message: 'Email sent',
  }
})
