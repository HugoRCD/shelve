import { z } from 'zod'
import { TeamRole } from '@types'

const createMemberSchema = z.object({
  email: z.string({
    error: 'Missing new member email',
  }).email().trim(),
  role: z.enum(TeamRole).default(TeamRole.MEMBER)
})

export default eventHandler(async (event) => {
  const slug = await getTeamSlugFromEvent(event)
  const { team, member } = await requireUserTeam(event, slug, { minRole: TeamRole.ADMIN })

  const { email, role } = await readValidatedBody(event, createMemberSchema.parse)

  // Adding someone who is already a member updates their role, so their current role counts too.
  const membersService = new MembersService()
  const existing = await membersService.isUserAlreadyMember(team.id, email)
  validateRoleAssignment(member, role, existing)
  if (existing) {
    return await membersService.updateMember({
      teamId: team.id,
      slug: team.slug,
      memberId: existing.id,
      role,
      currentRole: existing.role,
    })
  }

  return await membersService.addMember({
    teamId: team.id,
    slug: team.slug, // use for caching
    email,
    role
  })
})
