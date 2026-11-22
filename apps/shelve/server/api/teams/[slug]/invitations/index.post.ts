import { z } from 'zod'
import { TeamRole } from '@types'
import type { H3Event } from 'h3'

const createInvitationSchema = z.object({
  email: z.email('Invalid email address').trim(),
  role: z.enum(TeamRole).default(TeamRole.MEMBER)
})

export default eventHandler(async (event: H3Event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { user, team, member } = await requireUserTeam(event, slug, { minRole: TeamRole.ADMIN })

  const { email, role } = await readValidatedBody(event, createInvitationSchema.parse)
  validateRoleAssignment(member, role)
  // Before the invitation is stored, so a missing app URL leaves nothing behind.
  const appOrigin = getAppOrigin(event)

  const invitation = await new InvitationsService().createInvitation({
    teamId: team.id,
    slug: team.slug,
    email,
    role,
    invitedById: user.id,
  })

  // Send invitation email
  const inviteUrl = `${appOrigin}/invite/${invitation.token}`

  await new EmailService(event).sendInvitationEmail({
    email,
    teamName: team.name,
    inviterName: user.username,
    role,
    inviteUrl,
  })

  await logAudit(event, {
    teamId: team.id,
    action: 'team.member.invite',
    resourceType: 'user',
    metadata: { email, role },
  })

  return invitation
})
