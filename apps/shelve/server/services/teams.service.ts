import type {
  User,
  Member,
  Team,
  CreateTeamInput,
  DeleteTeamInput,
  UpdateTeamInput,
  ValidateAccess
} from '@shelve/types'
import {
  Role,
  TeamRole,
} from '@shelve/types'
import type { Storage, StorageValue } from 'unstorage'

export class TeamService {

  private readonly storage: Storage<StorageValue>
  private readonly CACHE_TTL = 60 * 60 // 1 hour
  private readonly CACHE_PREFIX = {
    team: 'nitro:functions:getTeam:teamId:',
    teams: 'nitro:functions:getTeams:userId:'
  }

  constructor() {
    this.storage = useStorage('cache')
  }

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

    await this.deleteCachedTeamsByUserId(input.requester.id)
    return createdTeam
  }

  async updateTeam(input: UpdateTeamInput): Promise<Team> {
    const { teamId, requester, ...data } = input
    await this.validateTeamAccess({ teamId, requester }, TeamRole.OWNER)

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
    await this.deleteCachedTeamById(teamId)
    await this.deleteCachedTeamsByUserId(teamId)
    return updatedTeam
  }

  async deleteTeam(input: DeleteTeamInput): Promise<void> {
    const { teamId, requester } = input
    await this.validateTeamAccess({ teamId, requester }, TeamRole.OWNER)
    const [team] = await useDrizzle().delete(tables.teams).where(eq(tables.teams.id, teamId)).returning({ id: tables.teams.id })
    if (!team) throw new Error(`Team not found after deletion with id ${teamId}`)
    await this.deleteCachedTeamsByUserId(teamId)
    await this.deleteCachedTeamById(teamId)
  }

  getTeamsByUserId = cachedFunction(async (userId): Promise<Team[]> => {
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
  }, {
    maxAge: this.CACHE_TTL,
    name: 'getTeams',
    getKey: (userId: number) => `userId:${userId}`,
  })

  getTeamById = cachedFunction(async (teamId, requester): Promise<Team> => {
    await this.validateTeamAccess({ teamId, requester })
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
  }, {
    maxAge: this.CACHE_TTL,
    name: 'getTeam',
    getKey: (team: Team) => `teamId:${team.id}`,
  })

  async getPrivateUserTeamId(userId: number): Promise<number> {
    const team = await useDrizzle().query.teams.findFirst({
      where: and(eq(tables.teams.private, true), eq(tables.teams.privateOf, userId)),
      columns: { id: true }
    })
    if (!team) throw new Error(`Private team not found for user with id ${userId}`)
    return team.id
  }

  async isUserAlreadyMember(teamId: number, email: string): Promise<Member | undefined> {
    const user = await this.getUserByEmail(email)
    if (!user) throw new Error(`User not found with email ${email}`)
    return await useDrizzle().query.members.findFirst({
      where: and(eq(tables.members.teamId, teamId), eq(tables.members.userId, user.id)),
      with: {
        user: true
      }
    })
  }

  async validateTeamAccess(input: ValidateAccess, minRole: TeamRole = TeamRole.MEMBER): Promise<boolean> {
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

  async getUserByEmail(email: string): Promise<User> {
    const user = await useDrizzle().query.users.findFirst({
      where: eq(tables.users.email, email)
    })
    if (!user) throw new Error(`User not found with email ${email}`)
    return user
  }

  async deleteCachedTeamById(teamId: number): Promise<void> {
    return await this.storage.removeItem(`${this.CACHE_PREFIX.team}${teamId}.json`)
  }

  async deleteCachedTeamsByUserId(userId: number): Promise<void> {
    return await this.storage.removeItem(`${this.CACHE_PREFIX.teams}${userId}.json`)
  }

  async deleteCachedForTeamMembers(teamId: number): Promise<void> {
    const members = await useDrizzle().query.members.findMany({ where: eq(tables.members.teamId, teamId) })
    await Promise.all(members.map(member => this.deleteCachedTeamsByUserId(member.userId)))
  }

}

