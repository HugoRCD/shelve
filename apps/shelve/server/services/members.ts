import type { AddMemberInput, Member, RemoveMemberInput, UpdateMemberInput, User } from '@types'
import { user as userTable } from '../db/schema'

type MemberWithUser = Omit<Member, 'user'> & { user: User | null }

export class MembersService {

  private setMemberUser(member: Member, user: User | null): Member {
    (member as MemberWithUser).user = user
    return member
  }

  async addMember(input: AddMemberInput): Promise<Member> {
    const { teamId, email, role, slug } = input
    const foundedMember = await this.isUserAlreadyMember(teamId, email)
    if (foundedMember) {
      return await this.updateMember({
        teamId,
        slug,
        memberId: foundedMember.id,
        role
      })
    }
    const user = await this.getUserByEmail(email)

    const [newMember] = await db.insert(schema.members)
      .values({
        userId: user.id,
        teamId,
        role,
      })
      .returning()
    if (!newMember) throw createError({ statusCode: 422, message: 'Failed to add member' })
    const member = await this.findMemberById(newMember.id)
    await clearCache('Team', slug)
    return member
  }

  async updateMember(input: UpdateMemberInput): Promise<Member> {
    const { slug, memberId, role } = input

    await db.update(schema.members)
      .set({
        role
      })
      .where(eq(schema.members.id, memberId))

    const member = await this.findMemberById(memberId)
    await clearCache('Team', slug)
    return member
  }

  async removeMember(input: RemoveMemberInput): Promise<void> {
    const { memberId, slug } = input

    const member = await this.findMemberById(memberId)
    await clearCache('Team', slug)
    await db.delete(schema.members).where(eq(schema.members.id, member.id))
  }

  async findMemberById(memberId: number): Promise<Member> {
    const member = await db.query.members.findFirst({
      where: eq(schema.members.id, memberId),
    })
    if (!member) throw createError({ statusCode: 404, message: `Member not found with id ${memberId}` })
    const [user] = await db.select().from(userTable).where(eq(userTable.id, member.userId)).limit(1)
    return this.setMemberUser(member, (user as User | undefined) ?? null)
  }

  async isUserAlreadyMember(teamId: number, email: string): Promise<Member | undefined> {
    const user = await this.getUserByEmail(email)
    if (!user) throw createError({ statusCode: 404, message: `User not found with email ${email}` })
    const member = await db.query.members.findFirst({
      where: and(eq(schema.members.teamId, teamId), eq(schema.members.userId, user.id)),
    })
    if (!member) return undefined
    return this.setMemberUser(member, user)
  }

  async getUserByEmail(email: string): Promise<User> {
    const [user] = await db.select().from(userTable).where(eq(userTable.email, email)).limit(1)
    if (!user) throw createError({ statusCode: 404, message: `User not found with email ${email}` })
    return user as User
  }

}
