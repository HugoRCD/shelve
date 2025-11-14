import type { H3Event } from 'h3'
import type { Member, Team, User } from '@types'
import { TeamRole } from '@types'

export async function validateTeamAccess(input: { user: User, teamSlug: string }): Promise<{ team: Team; member: Member }> {
  const { user, teamSlug } = input
  const team = await new TeamsService().getTeam(teamSlug)
  if (!team)
    throw createError({ statusCode: 404, statusMessage: 'Team not found' })

  const member = team.members.find((member) => member.userId === user.id)
  if (!member)
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized: User does not belong to the team' })

  return { team, member }
}

export function validateTeamRole(member: Member, minRole: TeamRole = TeamRole.MEMBER): boolean {
  const orderRole = {
    [TeamRole.OWNER]: 0,
    [TeamRole.ADMIN]: 1,
    [TeamRole.MEMBER]: 2,
  }
  if (orderRole[member.role] > orderRole[minRole])
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized: User does not have the required role' })
  return true
}
