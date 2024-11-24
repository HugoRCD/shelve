import type { AddMemberInput, Member, RemoveMemberInput, UpdateMemberInput } from '@shelve/types'
import { TeamRole } from '@shelve/types'
import { TeamService } from '~~/server/services/teams.service'

export class MemberService {

  private readonly TeamService: TeamService

  constructor() {
    this.TeamService = new TeamService()
  }

  async addMember(input: AddMemberInput): Promise<Member> {
    const { teamId, email, role, requester } = input
    await validateAccess({ teamId, requester }, TeamRole.ADMIN)
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

    const [newMember] = await useDrizzle().insert(tables.members)
      .values({
        userId: user.id,
        teamId,
        role,
      })
      .returning()
    if (!newMember) throw new Error('Failed to add member')
    const member = await this.findMemberById(newMember.id)
    await deleteCachedMembersByTeamId(teamId)
    await this.TeamService.deleteCachedForTeamMembers(teamId)
    return member
  }

  async updateMember(input: UpdateMemberInput): Promise<Member> {
    const { teamId, memberId, role, requester } = input
    await validateAccess({ teamId, requester }, TeamRole.ADMIN)

    await useDrizzle().update(tables.members)
      .set({
        role
      })
      .where(eq(tables.members.id, memberId))

    const member = await this.findMemberById(memberId)
    await deleteCachedMembersByTeamId(teamId)
    await this.TeamService.deleteCachedForTeamMembers(teamId)
    return member
  }

  async removeMember(input: RemoveMemberInput): Promise<void> {
    const { teamId, memberId, requester } = input
    await validateAccess({ teamId, requester }, TeamRole.ADMIN)

    const member = await this.findMemberById(memberId)
    await deleteCachedMembersByTeamId(teamId)
    await this.TeamService.deleteCachedForTeamMembers(teamId)
    await useDrizzle().delete(tables.members).where(eq(tables.members.id, member.id))
  }

  async findMemberById(memberId: number): Promise<Member> {
    const member = await useDrizzle().query.members.findFirst({
      where: eq(tables.members.id, memberId),
      with: {
        user: true
      }
    })
    if (!member) throw new Error(`Member not found with id ${memberId}`)
    return member
  }

  getTeamMembersById = cachedFunction(async (teamId, requester): Promise<Member[]> => {
    await validateAccess({ teamId, requester })
    const members = await useDrizzle().query.members.findMany({
      where: eq(tables.members.teamId, teamId),
      with: {
        user: true
      }
    })
    if (!members) throw new Error(`Members not found for team with id ${teamId}`)
    return members
  }, {
    maxAge: CACHE_TTL,
    name: 'getTeamMembers',
    getKey: (teamId) => `teamId:${teamId}`,
  })

}
