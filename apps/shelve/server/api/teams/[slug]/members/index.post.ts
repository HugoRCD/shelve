import { z } from 'zod'
import { TeamRole } from '@types'

const updateMemberByEmailSchema = z.object({
  email: z.string({
    error: 'Missing member email',
  }).email().trim(),
  role: z.enum(TeamRole).default(TeamRole.MEMBER)
})

/** Changes the role of an existing member found by email. New people join through invitations. */
export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team, member } = await requireUserTeam(event, slug, { minRole: TeamRole.ADMIN })

  const { email, role } = await readValidatedBody(event, updateMemberByEmailSchema.parse)

  const membersService = new MembersService()
  const existing = await membersService.findMemberByEmail(team.id, email)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Member not found' })
  validateRoleAssignment(member, role, existing)

  const updated = await membersService.updateMember({
    teamId: team.id,
    slug: team.slug,
    memberId: existing.id,
    role,
    currentRole: existing.role,
  })
  await logMemberRoleChange(event, team.id, updated, existing.role)
  return updated
})
