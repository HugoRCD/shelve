import type { H3Event } from 'h3'

export default eventHandler(async (event: H3Event) => {
  const token = getRouterParam(event, 'token')
  if (!token) {
    throw createError({ statusCode: 400, message: 'Token is required' })
  }

  const { user } = await requireUserSession(event)
  await new InvitationsService().declineInvitation(token, user.email)

  return { success: true }
})
