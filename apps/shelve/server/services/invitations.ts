import { randomBytes } from 'node:crypto'
import type { CreateInvitationInput, CancelInvitationInput, TeamInvitation, Member } from '@types'
import { InvitationStatus } from '@types'
import { and, eq, lt, desc } from 'drizzle-orm'

const INVITATION_EXPIRY_DAYS = 7

function generateInvitationToken(): string {
  return randomBytes(32).toString('hex')
}

export class InvitationsService {

  async createInvitation(input: CreateInvitationInput): Promise<TeamInvitation> {
    const { teamId, slug, email, role, invitedById } = input

    const existingMember = await this.isUserAlreadyMember(teamId, email)
    if (existingMember) {
      throw createError({ statusCode: 409, message: 'User is already a member of this team' })
    }

    const existingInvitation = await this.getPendingInvitationByEmail(teamId, email)
    if (existingInvitation) {
      throw createError({ statusCode: 409, message: 'An invitation has already been sent to this email' })
    }

    // Delete any old non-pending invitations for this email/team combo
    // This allows re-inviting someone after their previous invitation was accepted/declined/expired
    await db.delete(schema.invitations)
      .where(and(
        eq(schema.invitations.teamId, teamId),
        eq(schema.invitations.email, email)
      ))

    const token = generateInvitationToken()
    const expiresAt = new Date(Date.now() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

    const [invitation] = await db.insert(schema.invitations)
      .values({
        email,
        teamId,
        role,
        token,
        invitedById,
        expiresAt,
      })
      .returning()

    if (!invitation) {
      throw createError({ statusCode: 422, message: 'Failed to create invitation' })
    }

    const fullInvitation = await this.getInvitationById(invitation.id)
    await clearCache('Team', slug)
    return fullInvitation
  }

  async getInvitationByToken(token: string): Promise<TeamInvitation> {
    const invitation = await db.query.invitations.findFirst({
      where: eq(schema.invitations.token, token),
      with: {
        team: true,
        invitedBy: true,
      }
    })

    if (!invitation) {
      throw createError({ statusCode: 404, message: 'Invitation not found' })
    }

    if (new Date() > invitation.expiresAt && invitation.status === InvitationStatus.PENDING) {
      await this.updateInvitationStatus(invitation.id, InvitationStatus.EXPIRED)
      throw createError({ statusCode: 410, message: 'Invitation has expired' })
    }

    return invitation
  }

  async getInvitationById(invitationId: number): Promise<TeamInvitation> {
    const invitation = await db.query.invitations.findFirst({
      where: eq(schema.invitations.id, invitationId),
      with: {
        team: true,
        invitedBy: true,
      }
    })

    if (!invitation) {
      throw createError({ statusCode: 404, message: 'Invitation not found' })
    }

    return invitation
  }

  async getPendingInvitationByEmail(teamId: number, email: string): Promise<TeamInvitation | undefined> {
    return await db.query.invitations.findFirst({
      where: and(
        eq(schema.invitations.teamId, teamId),
        eq(schema.invitations.email, email),
        eq(schema.invitations.status, InvitationStatus.PENDING)
      ),
      with: {
        team: true,
        invitedBy: true,
      }
    })
  }

  async getTeamPendingInvitations(teamId: number): Promise<TeamInvitation[]> {
    return await db.query.invitations.findMany({
      where: and(
        eq(schema.invitations.teamId, teamId),
        eq(schema.invitations.status, InvitationStatus.PENDING)
      ),
      with: {
        team: true,
        invitedBy: true,
      },
      orderBy: [desc(schema.invitations.createdAt)]
    })
  }

  async acceptInvitation(token: string, userId: string, userEmail: string): Promise<Member> {
    const invitation = await this.getInvitationByToken(token)

    if (invitation.status !== InvitationStatus.PENDING) {
      throw createError({ statusCode: 400, message: `Invitation has already been ${invitation.status}` })
    }

    // Verify email matches
    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      throw createError({
        statusCode: 403,
        message: 'This invitation was sent to a different email address'
      })
    }

    const existingMember = await db.query.members.findFirst({
      where: and(
        eq(schema.members.teamId, invitation.teamId),
        eq(schema.members.userId, userId)
      ),
      with: { user: true }
    })

    if (existingMember) {
      await this.updateInvitationStatus(invitation.id, InvitationStatus.ACCEPTED)
      return existingMember
    }

    const [newMember] = await db.insert(schema.members)
      .values({
        userId,
        teamId: invitation.teamId,
        role: invitation.role,
      })
      .returning()

    if (!newMember) {
      throw createError({ statusCode: 422, message: 'Failed to add member' })
    }

    await this.updateInvitationStatus(invitation.id, InvitationStatus.ACCEPTED)

    if (invitation.team) {
      await clearCache('Team', invitation.team.slug)
    }

    const member = await db.query.members.findFirst({
      where: eq(schema.members.id, newMember.id),
      with: { user: true }
    })

    if (!member) {
      throw createError({ statusCode: 422, message: 'Failed to retrieve member' })
    }

    return member
  }

  async declineInvitation(token: string): Promise<void> {
    const invitation = await this.getInvitationByToken(token)

    if (invitation.status !== InvitationStatus.PENDING) {
      throw createError({ statusCode: 400, message: `Invitation has already been ${invitation.status}` })
    }

    await this.updateInvitationStatus(invitation.id, InvitationStatus.DECLINED)
  }

  async cancelInvitation(input: CancelInvitationInput): Promise<void> {
    const { invitationId, slug } = input

    const invitation = await this.getInvitationById(invitationId)

    if (invitation.status !== InvitationStatus.PENDING) {
      throw createError({ statusCode: 400, message: 'Can only cancel pending invitations' })
    }

    await db.delete(schema.invitations)
      .where(eq(schema.invitations.id, invitationId))

    await clearCache('Team', slug)
  }

  async deleteExpiredInvitations(): Promise<number> {
    const result = await db.delete(schema.invitations)
      .where(
        and(
          eq(schema.invitations.status, InvitationStatus.PENDING),
          lt(schema.invitations.expiresAt, new Date())
        )
      )
      .returning()

    return result.length
  }

  private async updateInvitationStatus(invitationId: number, status: InvitationStatus): Promise<void> {
    await db.update(schema.invitations)
      .set({ status })
      .where(eq(schema.invitations.id, invitationId))
  }

  private async isUserAlreadyMember(teamId: number, email: string): Promise<Member | undefined> {
    const user = await db.query.user.findFirst({
      where: eq(schema.user.email, email)
    })

    if (!user) return undefined

    return db.query.members.findFirst({
      where: and(
        eq(schema.members.teamId, teamId),
        eq(schema.members.userId, user.id)
      ),
      with: { user: true }
    })
  }

}
