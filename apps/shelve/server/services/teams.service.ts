import type {
  Team,
  CreateTeamInput,
  DeleteTeamInput,
  UpdateTeamInput,
} from '@shelve/types'
import { TeamRole } from '@shelve/types'

export class TeamService {

  async createTeam(input: CreateTeamInput): Promise<Team> {
    const [team] = await useDrizzle().insert(tables.teams)
      .values({
        name: input.name,
        private: input.private || false,
        privateOf: input.private ? input.requester.id : null,
        logo: input.logo
      })
      .returning()
    if (!team) throw new Error('Team not found after creation')

    await useDrizzle().insert(tables.members)
      .values({
        userId: input.requester.id,
        teamId: team.id,
        role: TeamRole.OWNER
      })

    const createdTeam = await useDrizzle().query.teams.findFirst({
      where: eq(tables.teams.id, team.id),
      with: {
        members: {
          with: {
            user: true
          }
        }
      }
    })
    if (!createdTeam) throw new Error(`Team not found after creation with id ${ team.id }`)

    await clearCache('Teams', input.requester.id)
    return createdTeam
  }

  async updateTeam(input: UpdateTeamInput): Promise<Team> {
    const { teamId, requester, ...data } = input
    await validateAccess({ teamId, requester }, TeamRole.OWNER)

    await useDrizzle().update(tables.teams)
      .set(data)
      .where(eq(tables.teams.id, teamId))

    const updatedTeam = await useDrizzle().query.teams.findFirst({
      where: eq(tables.teams.id, teamId),
      with: {
        members: {
          with: {
            user: true
          }
        }
      }
    })
    if (!updatedTeam) throw new Error(`Team not found with id ${teamId}`)
    await clearCache('Teams', teamId)
    return updatedTeam
  }

  async deleteTeam(input: DeleteTeamInput): Promise<void> {
    const { teamId, requester } = input
    await validateAccess({ teamId, requester }, TeamRole.OWNER)
    const [team] = await useDrizzle().delete(tables.teams).where(eq(tables.teams.id, teamId)).returning({ id: tables.teams.id })
    if (!team) throw new Error(`Team not found after deletion with id ${teamId}`)
    await clearCache('Teams', teamId)
  }

  getTeams = withCache<Team[]>('Teams', async (userId) => {
    const memberOf = await useDrizzle().query.members.findMany({
      where: eq(tables.members.userId, userId),
      with: {
        team: {
          with: {
            members: {
              with: {
                user: true
              }
            }
          }
        }
      }
    })
    const teams = memberOf.map(member => member.team)
    if (!teams) throw new Error(`Teams not found for user with id ${userId}`)
    return teams
  })

  getTeam = withCache<Team>('Team', async (teamId, requester) => {
    await validateAccess({ teamId, requester })
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
    return team
  })

  async getPrivateUserTeamId(userId: number): Promise<number> {
    const team = await useDrizzle().query.teams.findFirst({
      where: and(eq(tables.teams.private, true), eq(tables.teams.privateOf, userId)),
      columns: { id: true }
    })
    if (!team) throw new Error(`Private team not found for user with id ${userId}`)
    return team.id
  }

}

