import { Project, Role, TeamRole, type ValidateAccess } from '@shelve/types'

export async function validateAccess(input: ValidateAccess, minRole: TeamRole = TeamRole.MEMBER): Promise<boolean> {
  const { teamId, requester } = input
  const team = await useDrizzle().query.teams.findFirst({
    where: eq(tables.teams.id, teamId),
    with: {
      members: {
        with: {
          user: true
        }
      }
    }
  })
  if (!team) throw new Error(`Team not found with id ${teamId}`)
  if (requester.role === Role.ADMIN) return true
  const member = team.members.find(member => member.userId === requester.id)
  if (!member) throw new Error('Unauthorized: Member does not belong to the team')
  const orderRole = {
    [TeamRole.OWNER]: 0,
    [TeamRole.ADMIN]: 1,
    [TeamRole.MEMBER]: 2,
  }
  if (orderRole[member.role] > orderRole[minRole])
    throw new Error('Unauthorized: Member does not have the required role')
  return true
}

export async function hasAccessToProject(projectId: number, userId: number): Promise<Project> {
  const project = await useDrizzle().query.projects.findFirst({
    where: eq(tables.projects.id, projectId),
    with: {
      team: {
        with: {
          members: {
            where: eq(tables.members.userId, userId)
          }
        }
      }
    }
  })

  if (!project) throw createError({ statusCode: 401, message: 'Unauthorized' })

  return project
}
