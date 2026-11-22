import type { Member, RemoveMemberInput, UpdateMemberInput } from '@types'
import { TeamRole } from '@types'

export class MembersService {

  async updateMember(input: UpdateMemberInput): Promise<Member> {
    const { teamId, slug, memberId, role, currentRole } = input

    await db.transaction(async (tx) => {
      if (currentRole === TeamRole.OWNER && role !== TeamRole.OWNER) await requireAnotherOwner(tx, teamId)

      const [updated] = await tx.update(schema.members)
        .set({
          role
        })
        .where(and(eq(schema.members.id, memberId), eq(schema.members.teamId, teamId), eq(schema.members.role, currentRole)))
        .returning({ id: schema.members.id })
      if (!updated) throw createError({ statusCode: 409, message: 'Member role changed during the update, try again' })
    })

    const member = await this.findMemberById(memberId)
    await clearCache('Team', slug)
    return member
  }

  async removeMember(input: RemoveMemberInput): Promise<void> {
    const { teamId, memberId, slug } = input

    await db.transaction(async (tx) => {
      await lockTeam(tx, teamId)
      const member = await tx.query.members.findFirst({
        where: and(eq(schema.members.id, memberId), eq(schema.members.teamId, teamId)),
        columns: { id: true, role: true },
      })
      if (!member) throw createError({ statusCode: 404, message: `Member not found with id ${memberId}` })
      if (member.role === TeamRole.OWNER) await requireAnotherOwner(tx, teamId)
      await tx.delete(schema.members).where(and(eq(schema.members.id, member.id), eq(schema.members.teamId, teamId)))
    })
    await clearCache('Team', slug)
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

  /** The team's member with this email, or `undefined` whether or not the email has an account. */
  async findMemberByEmail(teamId: number, email: string): Promise<Member | undefined> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, email),
      columns: { id: true },
    })
    if (!user) return undefined
    return db.query.members.findFirst({
      where: and(eq(schema.members.teamId, teamId), eq(schema.members.userId, user.id)),
      with: {
        user: { columns: PUBLIC_USER_COLUMNS }
      }
    })
  }

}

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

/**
 * Locks the team's row until the transaction ends, so owner changes on the same team run one after
 * another: each one counts the owners only after the previous one is committed.
 */
async function lockTeam(tx: Transaction, teamId: number): Promise<void> {
  await tx.select({ id: schema.teams.id }).from(schema.teams).where(eq(schema.teams.id, teamId)).for('update')
}

/** A team always keeps at least one owner, who alone can delete it. */
async function requireAnotherOwner(tx: Transaction, teamId: number): Promise<void> {
  await lockTeam(tx, teamId)
  const owners = await tx.query.members.findMany({
    where: and(eq(schema.members.teamId, teamId), eq(schema.members.role, TeamRole.OWNER)),
    columns: { id: true },
  })
  if (owners.length < 2) throw createError({ statusCode: 409, message: 'A team needs at least one owner' })
}
