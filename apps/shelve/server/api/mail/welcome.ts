/*
import { EmailService } from '~~/server/services/resend'

export default defineEventHandler(async (event) => {
  const { email, username } = await readBody(event)
  console.log(event)
  const emailService = new EmailService()
  await emailService.sendWelcomeEmail(email, username, event.node.req.url!)
  return {
    statusCode: 200,
    message: 'Email sent',
  }
})
*/
