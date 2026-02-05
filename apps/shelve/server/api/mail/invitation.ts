export default defineEventHandler(async (event) => {
  const { email, teamName, inviterName, role } = await readBody(event)
  const appUrl = getRequestHost(event)
  const inviteUrl = `${appUrl}/invite/test-token-preview`

  const emailService = new EmailService(event)
  await emailService.sendInvitationEmail(email, teamName, inviterName, role, inviteUrl)

  return {
    statusCode: 200,
    message: 'Invitation email sent',
  }
})
