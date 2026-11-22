import { TeamRole } from '@types'
import type { H3Event } from 'h3'
import { idParamsSchema } from '~~/server/db/zod'

export default eventHandler(async (event: H3Event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team, member } = await requireUserTeam(event, slug, { minRole: TeamRole.ADMIN })

  const { id } = await getValidatedRouterParams(event, idParamsSchema.parse)

  const invitationsService = new InvitationsService()
  const invitation = await invitationsService.getInvitationById(id)
  if (invitation.teamId !== team.id) throw createError({ statusCode: 404, message: 'Invitation not found' })
  validateRoleAssignment(member, invitation.role)

  await invitationsService.cancelInvitation({
    invitationId: id,
    teamId: team.id,
    slug: team.slug,
  })

  return { success: true }
})
