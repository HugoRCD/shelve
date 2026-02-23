import type { H3Event } from 'h3'
import { user as userTable } from '../../../db/schema'

export default eventHandler(async (event: H3Event) => {
  const token = getRouterParam(event, 'token')
  if (!token) {
    throw createError({ statusCode: 400, message: 'Token is required' })
  }

  const { user } = await requireAppSession(event)

  const invitation = await new InvitationsService().getInvitationByToken(token)

  const member = await new InvitationsService().acceptInvitation(token, user.id, user.email)

  if (!user.onboarding) {
    await db.update(userTable)
      .set({ onboarding: true })
      .where(eq(userTable.id, user.id))
  }

  if (invitation.team?.slug) {
    setCookie(event, 'defaultTeamSlug', invitation.team.slug)
  }

  return {
    success: true,
    member,
    teamSlug: invitation.team?.slug || null,
  }
})
