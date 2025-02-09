export default defineEventHandler(async (event) => {
  const { email, username } = await readBody(event)
  const appUrl= getRequestHost(event)
  const emailService = new EmailService(event)
  await emailService.sendWelcomeEmail(email, username, appUrl)
  return {
    statusCode: 200,
    message: 'Email sent',
  }
})
