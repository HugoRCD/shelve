import type {
  AddMemberInput,
  CreateTeamInput,
  DeleteTeamInput,
  Member,
  RemoveMemberInput,
  Team,
  UpdateMemberInput,
  User,
  ValidateAccess
} from '@shelve/types'
import { Role, TeamRole, } from '@shelve/types'
import type { Storage, StorageValue } from 'unstorage'
// import { ProjectService } from '~~/server/services/project.service'

export class TeamService {

  private readonly storage: Storage<StorageValue>
  private readonly CACHE_TTL = 60 * 60 // 1 hour
  private readonly CACHE_PREFIX = 'nitro:functions:getTeamByUserId:userId:'

  constructor() {
    this.storage = useStorage('cache')
  }

  async createTeam(input: CreateTeamInput): Promise<Team> {
    return await db.transaction(async (tx) => {
      const [team] = await tx.insert(tables.teams)
        .values({
          name: input.name,
          private: input.private,
        })
        .returning()

      await tx.insert(tables.members)
        .values({
          userId: input.requester.id,
          teamId: team.id,
          role: TeamRole.OWNER
        })

      const createdTeam = await tx.query.teams.findFirst({
        where: eq(tables.teams.id, team.id),
        with: {
          members: {
            with: {
              user: true
            }
          }
        }
      })
      if (!createdTeam) throw new Error(`Team not found after creation with id ${team.id}`)
      return createdTeam
    })
  }

  async deleteTeam(input: DeleteTeamInput): Promise<void> {
    const { teamId, requester } = input
    await this.validateTeamAccess({ teamId, requester }, TeamRole.OWNER)
    await this.deleteCachedTeamByUserId(requester.id)
    await this.deleteCachedTeamByUserId(teamId)

    await db.delete(tables.teams).where(eq(tables.teams.id, teamId))
  }

  async addMember(input: AddMemberInput): Promise<Member> {
    const { teamId, email, role, requester } = input
    await this.validateTeamAccess({ teamId, requester }, TeamRole.ADMIN)
    const foundedMember = await this.isUserAlreadyMember(teamId, email)
    if (foundedMember) {
      return await this.updateMember({
        teamId,
        memberId: foundedMember.id,
        role,
        requester
      })
    }
    const user = await this.getUserByEmail(email)
    await this.deleteCachedTeamByUserId(requester.id)
    await this.deleteCachedTeamByUserId(user.id)

    await db.insert(tables.members)
      .values({
        userId: user.id,
        teamId,
        role,
      })
      .returning()

    const member = await db.query.members.findFirst({
      where: eq(tables.members.userId, user.id),
      with: {
        user: true
      }
    })
    if (!member) throw new Error(`Member not found after creation with id ${user.id}`)
    return member
  }

  async updateMember(input: UpdateMemberInput): Promise<Member> {
    const { teamId, memberId, role, requester } = input
    await this.validateTeamAccess({ teamId, requester }, TeamRole.ADMIN)
    await this.deleteCachedTeamByUserId(requester.id)
    await this.deleteCachedTeamByUserId(memberId)

    await db.update(tables.members)
      .set({
        role
      })
      .where(eq(tables.members.id, memberId))

    const member = await db.query.members.findFirst({
      where: eq(tables.members.id, memberId),
      with: {
        user: true
      }
    })
    if (!member) throw new Error(`Member not found with id ${memberId}`)
    return member
  }

  async removeMember(input: RemoveMemberInput): Promise<void> {
    const { teamId, memberId, requester } = input
    await this.validateTeamAccess({ teamId, requester }, TeamRole.ADMIN)
    await this.deleteCachedTeamByUserId(requester.id)
    await this.deleteCachedTeamByUserId(memberId)

    const member = await db.query.members.findFirst({
      where: eq(tables.members.id, memberId),
      with: {
        user: true
      }
    })
    if (!member) throw new Error(`Member not found with id ${memberId}`)
    await db.delete(tables.members).where(eq(tables.members.id, memberId))
  }

  getTeamsByUserId = cachedFunction(async (userId): Promise<Team[]> => {
    const teams = await db.query.teams.findMany({
      where: eq(tables.members.userId, userId),
      with: {
        members: {
          with: {
            user: true
          }
        }
      }
    })
    if (!teams) throw new Error(`Teams not found for user with id ${userId}`)
    return teams
  }, {
    maxAge: this.CACHE_TTL,
    name: 'getTeamByUserId',
    getKey: (userId: number) => `userId:${userId}`,
  })

  private async isUserAlreadyMember(teamId: number, email: string): Promise<Member | undefined> {
    const user = await this.getUserByEmail(email)
    if (!user) throw new Error(`User not found with email ${email}`)
    return await db.query.members.findFirst({
      where: and(eq(tables.members.teamId, teamId), eq(tables.members.id, user.id)),
      with: {
        user: true
      }
    })
  }

  private async validateTeamAccess(input: ValidateAccess, minRole: TeamRole = TeamRole.MEMBER): Promise<boolean> {
    const { teamId, requester } = input
    const team = await db.query.teams.findFirst({
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

  private deleteCachedTeamByUserId(userId: number): Promise<void> {
    return this.storage.removeItem(`${this.CACHE_PREFIX}${userId}.json`)
  }

  private async getUserByEmail(email: string): Promise<User> {
    const user = await db.query.users.findFirst({
      where: eq(tables.users.email, email)
    })
    if (!user) throw new Error(`User not found with email ${email}`)
    return user
  }

}

