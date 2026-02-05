import { TeamRole } from '@types'
import type { H3Event } from 'h3'

export default eventHandler(async (event: H3Event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team } = await requireUserTeam(event, slug, { minRole: TeamRole.ADMIN })

  return await new InvitationsService().getTeamPendingInvitations(team.id)
})
