import type { AddMemberInput, Member, RemoveMemberInput, UpdateMemberInput, User } from '@types'

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
    const { teamId, slug, memberId, role } = input

    const [updated] = await db.update(schema.members)
      .set({
        role
      })
      .where(and(eq(schema.members.id, memberId), eq(schema.members.teamId, teamId)))
      .returning({ id: schema.members.id })
    if (!updated) throw createError({ statusCode: 404, message: `Member not found with id ${memberId}` })

    const member = await this.findMemberById(memberId)
    await clearCache('Team', slug)
    return member
  }

  async removeMember(input: RemoveMemberInput): Promise<void> {
    const { teamId, memberId, slug } = input

    const member = await this.findMemberById(memberId)
    await clearCache('Team', slug)
    await db.delete(schema.members).where(and(eq(schema.members.id, member.id), eq(schema.members.teamId, teamId)))
  }

  async findMemberById(memberId: number): Promise<Member> {
    const member = await db.query.members.findFirst({
      where: eq(schema.members.id, memberId),
      with: {
        user: { columns: PUBLIC_USER_COLUMNS }
      }
    })
    if (!member) throw createError({ statusCode: 404, message: `Member not found with id ${memberId}` })
    return member
  }

  async isUserAlreadyMember(teamId: number, email: string): Promise<Member | undefined> {
    const user = await this.getUserByEmail(email)
    if (!user) throw createError({ statusCode: 404, message: `User not found with email ${email}` })
    return db.query.members.findFirst({
      where: and(eq(schema.members.teamId, teamId), eq(schema.members.userId, user.id)),
      with: {
        user: { columns: PUBLIC_USER_COLUMNS }
      }
    })
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, email)
    })
    if (!user) throw createError({ statusCode: 404, message: `User not found with email ${email}` })
    return user
  }

}
