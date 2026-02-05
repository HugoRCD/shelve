import { z } from 'zod'
import { TeamRole } from '@types'
import type { H3Event } from 'h3'

const createInvitationSchema = z.object({
  email: z.email('Invalid email address').trim(),
  role: z.enum(TeamRole).default(TeamRole.MEMBER)
})

export default eventHandler(async (event: H3Event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { user, team } = await requireUserTeam(event, slug, { minRole: TeamRole.ADMIN })

  const { email, role } = await readValidatedBody(event, createInvitationSchema.parse)

  const invitation = await new InvitationsService().createInvitation({
    teamId: team.id,
    slug: team.slug,
    email,
    role,
    invitedById: user.id,
  })

  // Send invitation email
  const config = useRuntimeConfig(event)
  const appUrl = config.public.appUrl || 'http://localhost:3000'
  const inviteUrl = `${appUrl}/invite/${invitation.token}`

  await new EmailService(event).sendInvitationEmail(
    email,
    team.name,
    user.username,
    role,
    inviteUrl
  )

  return invitation
})
