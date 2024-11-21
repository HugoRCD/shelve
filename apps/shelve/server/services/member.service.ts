import type { Storage, StorageValue } from 'unstorage'
import type { AddMemberInput, Member, RemoveMemberInput, UpdateMemberInput } from '@shelve/types'
import { TeamRole } from '@shelve/types'
import { TeamService } from '~~/server/services/teams.service'

export class MemberService {

  private readonly storage: Storage<StorageValue>
  private readonly TeamService: TeamService
  private readonly CACHE_TTL = 60 * 60 // 1 hour
  private readonly CACHE_PREFIX = {
    members: 'nitro:functions:getTeamMembers:teamId:'
  }

  constructor() {
    this.storage = useStorage('cache')
    this.TeamService = new TeamService()
  }

  async addMember(input: AddMemberInput): Promise<Member> {
    const { teamId, email, role, requester } = input
    await this.TeamService.validateTeamAccess({ teamId, requester }, TeamRole.ADMIN)
    const foundedMember = await this.TeamService.isUserAlreadyMember(teamId, email)
    if (foundedMember) {
      return await this.updateMember({
        teamId,
        memberId: foundedMember.id,
        role,
        requester
      })
    }
    const user = await this.TeamService.getUserByEmail(email)

    const [newMember] = await db.insert(tables.members)
      .values({
        userId: user.id,
        teamId,
        role,
      })
      .returning()
    if (!newMember) throw new Error('Failed to add member')
    const member = await this.findMemberById(newMember.id)
    await this.deleteCachedMembersByTeamId(teamId)
    await this.TeamService.deleteCachedForTeamMembers(teamId)
    return member
  }

  async updateMember(input: UpdateMemberInput): Promise<Member> {
    const { teamId, memberId, role, requester } = input
    await this.TeamService.validateTeamAccess({ teamId, requester }, TeamRole.ADMIN)

    await db.update(tables.members)
      .set({
        role
      })
      .where(eq(tables.members.id, memberId))

    const member = await this.findMemberById(memberId)
    await this.deleteCachedMembersByTeamId(teamId)
    await this.TeamService.deleteCachedForTeamMembers(teamId)
    return member
  }

  async removeMember(input: RemoveMemberInput): Promise<void> {
    const { teamId, memberId, requester } = input
    await this.TeamService.validateTeamAccess({ teamId, requester }, TeamRole.ADMIN)

    const member = await this.findMemberById(memberId)
    await this.deleteCachedMembersByTeamId(teamId)
    await this.TeamService.deleteCachedForTeamMembers(teamId)
    await db.delete(tables.members).where(eq(tables.members.id, member.id))
  }

  async findMemberById(memberId: number): Promise<Member> {
    const member = await db.query.members.findFirst({
      where: eq(tables.members.id, memberId),
      with: {
        user: true
      }
    })
    if (!member) throw new Error(`Member not found with id ${memberId}`)
    return member
  }

  getTeamMembersById = cachedFunction(async (teamId, requester): Promise<Member[]> => {
    await this.TeamService.validateTeamAccess({ teamId, requester })
    const members = await db.query.members.findMany({
      where: eq(tables.members.teamId, teamId),
      with: {
        user: true
      }
    })
    if (!members) throw new Error(`Members not found for team with id ${teamId}`)
    return members
  }, {
    maxAge: this.CACHE_TTL,
    name: 'getTeamMembers',
    getKey: (teamId) => `teamId:${teamId}`,
  })

  private async deleteCachedMembersByTeamId(teamId: number) {
    await this.storage.removeItem(`${this.CACHE_PREFIX.members}${teamId}`)
  }

}
