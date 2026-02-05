import type { H3Event } from 'h3'

export default eventHandler(async (event: H3Event) => {
  const token = getRouterParam(event, 'token')
  if (!token) {
    throw createError({ statusCode: 400, message: 'Token is required' })
  }

  const invitation = await new InvitationsService().getInvitationByToken(token)

  // Return invitation info without exposing the full token
  return {
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
    createdAt: invitation.createdAt,
    team: invitation.team ? {
      id: invitation.team.id,
      name: invitation.team.name,
      slug: invitation.team.slug,
      logo: invitation.team.logo,
    } : undefined,
    invitedBy: invitation.invitedBy ? {
      id: invitation.invitedBy.id,
      username: invitation.invitedBy.username,
      avatar: invitation.invitedBy.avatar,
    } : undefined,
  }
})
