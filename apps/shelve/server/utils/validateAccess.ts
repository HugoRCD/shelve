import { Member, Team, TeamRole, User } from '@shelve/types'
import { H3Event } from 'h3'

export async function validateTeamAccess(input: { user: User, teamId: number }): Promise<Team> {
  const { user, teamId } = input
  const team = await useDrizzle().query.teams.findFirst({
    where: eq(tables.teams.id, teamId),
    with: {
      members: {
        where: eq(tables.members.userId, user.id)
      }
    }
  })
  if (!team) throw createError({ statusCode: 401, message: 'Unauthorized: User does not belong to the team' })
  return team
}

export function validateTeamRole(member: Member, minRole: TeamRole = TeamRole.MEMBER): boolean {
  const orderRole = {
    [TeamRole.OWNER]: 0,
    [TeamRole.ADMIN]: 1,
    [TeamRole.MEMBER]: 2,
  }
  if (orderRole[member.role] > orderRole[minRole])
    throw createError({ statusCode: 401, message: 'Unauthorized: User does not have the required role' })
  return true
}

export function useCurrentTeam(event: H3Event): Team {
  const { team } = event.context
  if (!team) throw createError({ statusCode: 500, message: 'Team not found' })
  return team
}

export function useCurrentMember(event: H3Event): Member {
  const { currentMember } = event.context
  if (!currentMember) throw createError({ statusCode: 500, message: 'Member not found' })
  return currentMember
}
