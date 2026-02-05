import { TeamRole } from '@types'
import type { H3Event } from 'h3'

export default eventHandler(async (event: H3Event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug, { minRole: TeamRole.ADMIN })

  const invitationId = getRouterParam(event, 'id')
  if (!invitationId) {
    throw createError({ statusCode: 400, message: 'Invitation ID is required' })
  }

  await new InvitationsService().cancelInvitation({
    invitationId: parseInt(invitationId, 10),
    slug: team.slug,
  })

  return { success: true }
})
