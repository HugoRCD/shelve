export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { email, username } = await readBody(event)
  const emailService = new EmailService(event)
  await emailService.sendWelcomeEmail(email, username)
  return {
    statusCode: 200,
    message: 'Email sent',
  }
})
