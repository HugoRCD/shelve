import type { H3Event } from 'h3'
// import { EmailService } from '~~/server/services/resend.service'

export default defineEventHandler((event: H3Event) => {
  /*const { email, username } = await readBody(event)
  const emailService = new EmailService()
  await emailService.sendWelcomeEmail(email, username)*/
  return {
    statusCode: 200,
    message: 'Email sent',
  }
})
