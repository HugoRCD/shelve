import type { AddMemberInput, Member, RemoveMemberInput, UpdateMemberInput, User } from '@types'
import { user as authUser } from '../db/schema/better-auth.postgresql'

export class MembersService {

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
    const rows = await db.select().from(authUser).where(eq(authUser.id, member.userId)).limit(1)
    ;(member as any).user = (rows[0] as unknown as User | undefined) || null
    return member
  }

  async isUserAlreadyMember(teamId: number, email: string): Promise<Member | undefined> {
    const user = await this.getUserByEmail(email)
    if (!user) throw createError({ statusCode: 404, message: `User not found with email ${email}` })
    const member = await db.query.members.findFirst({
      where: and(eq(schema.members.teamId, teamId), eq(schema.members.userId, user.id)),
    })
    if (!member) return undefined
    ;(member as any).user = user
    return member
  }

  async getUserByEmail(email: string): Promise<User> {
    const rows = await db.select().from(authUser).where(eq(authUser.email, email)).limit(1)
    const user = rows[0] as unknown as User | undefined
    if (!user) throw createError({ statusCode: 404, message: `User not found with email ${email}` })
    return user
  }

}
