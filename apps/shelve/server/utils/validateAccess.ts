import type { H3Event } from 'h3'
import { and, eq } from 'drizzle-orm'
import type { Member, Team, User } from '@types'
import { TeamRole } from '@types'

export async function validateTeamAccess(input: { user: User, teamSlug: string }): Promise<{ team: Team; member: Member }> {
  const { user, teamSlug } = input
  const team = await new TeamsService().getTeam(teamSlug)
  if (!team || team.slug !== teamSlug)
    throw createError({ statusCode: 404, statusMessage: 'Team not found' })

  // Read the membership itself rather than the cached team, so a removal or a role change applies on the next request.
  const member = await db.query.members.findFirst({
    where: and(eq(schema.members.teamId, team.id), eq(schema.members.userId, user.id)),
    with: {
      user: { columns: PUBLIC_USER_COLUMNS }
    }
  })
  if (!member)
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized: User does not belong to the team' })

  return { team, member }
}

const orderRole = {
  [TeamRole.OWNER]: 0,
  [TeamRole.ADMIN]: 1,
  [TeamRole.MEMBER]: 2,
}

export function validateTeamRole(member: Member, minRole: TeamRole = TeamRole.MEMBER): boolean {
  if (orderRole[member.role] > orderRole[minRole])
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized: User does not have the required role' })
  return true
}

/**
 * Whether the caller may give `role`, and change the role of `target`: never above the caller's own rank,
 * so an admin can neither make anyone (themselves included) an owner nor demote an owner.
 */
export function canAssignRole(caller: Pick<Member, 'role'>, role: TeamRole, target?: Pick<Member, 'role'>): boolean {
  const callerRank = orderRole[caller.role]
  return orderRole[role] >= callerRank && (!target || orderRole[target.role] >= callerRank)
}

export function validateRoleAssignment(caller: Pick<Member, 'role'>, role: TeamRole, target?: Pick<Member, 'role'>): void {
  if (!canAssignRole(caller, role, target))
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized: Cannot assign a role above your own' })
}
