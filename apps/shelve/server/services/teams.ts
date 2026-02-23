import type { CreateTeamInput, DeleteTeamInput, Team, UpdateTeamInput } from '@types'
import { TeamRole } from '@types'
import { inArray } from 'drizzle-orm'
import { user as userTable } from '../db/schema'

type TeamMember = Team['members'][number]
type TeamMemberWithUser = Omit<TeamMember, 'user'> & { user: typeof userTable.$inferSelect | null }

export const BLACKLIST_TEAM_SLUGS: string[] = [
  'user',
  'settings',
  'admin',
  'integrations',
  'about',
  'join',
  'beta',
  'changelog',
  'releases',
  'pricing',
  'terms',
  'privacy',
  'docs',
  'blog',
  'features',
  'module',
  'auth',
  'console',
  'dashboard',
  'account',
  'profile',
  'billing',
  'download',
  'login',
  'logout',
  'signup',
  'signin',
  'register',
  'local',
  'embed',
  'roadmap'
]

export class TeamsService {

  private setMemberUser(member: TeamMember, user: typeof userTable.$inferSelect | null): void {
    (member as TeamMemberWithUser).user = user
  }

  private async hydrateTeamUsers(team: Team): Promise<Team> {
    const memberUserIds = [...new Set(team.members.map((member) => member.userId))]
    if (!memberUserIds.length) return team

    const users = await db.select().from(userTable).where(inArray(userTable.id, memberUserIds))
    const usersById = new Map<string, typeof userTable.$inferSelect>()
    for (const user of users) {
      usersById.set(user.id, user)
    }

    for (const member of team.members) {
      // Keep response shape stable for the UI: `member.user` is optional/null if missing.
      this.setMemberUser(member, usersById.get(member.userId) || null)
    }

    return team
  }

  private async hydrateTeamsUsers(teams: Team[]): Promise<Team[]> {
    if (!teams.length) return teams

    const userIds = [...new Set(teams.flatMap((team) => team.members.map((member) => member.userId)))]
    if (!userIds.length) return teams

    const users = await db.select().from(userTable).where(inArray(userTable.id, userIds))
    const usersById = new Map<string, typeof userTable.$inferSelect>()
    for (const user of users) {
      usersById.set(user.id, user)
    }

    for (const team of teams) {
      for (const member of team.members) {
        this.setMemberUser(member, usersById.get(member.userId) || null)
      }
    }

    return teams
  }

  async createTeam(input: CreateTeamInput): Promise<Team> {
    const slug = input.name.toLowerCase().replace(/\s/g, '-')

    // Check uniqueness BEFORE transaction to avoid PGlite deadlock
    const isSlugUnique = await this.isSlugUnique(slug)
    if (!isSlugUnique) {
      throw createError({ statusCode: 409, statusMessage: 'Team name already in use' })
    }
    if (BLACKLIST_TEAM_SLUGS.includes(slug)) {
      throw createError({ statusCode: 409, statusMessage: 'Team slug is blacklisted' })
    }

    const team = await db.transaction(async (tx: any) => {
      const [newTeam] = await tx.insert(schema.teams)
        .values({
          slug,
          name: input.name,
          logo: input.logo
        })
        .returning()

      if (!newTeam) throw createError({ statusCode: 422, statusMessage: 'Failed to create team' })

      await tx.insert(schema.members)
        .values({
          userId: input.requester.id,
          teamId: newTeam.id,
          role: TeamRole.OWNER
        })

      return newTeam
    })

    await new EnvironmentsService().initializeBaseEnvironments(team.id)

    const createdTeam = await db.query.teams.findFirst({
      where: eq(schema.teams.id, team.id),
      with: {
        members: true
      }
    })

    if (!createdTeam) throw createError({ statusCode: 404, statusMessage: `Team not found with id ${team.id}` })
    await clearCache('Teams', input.requester.id)
    return this.hydrateTeamUsers(createdTeam)
  }

  async updateTeam(input: UpdateTeamInput): Promise<Team> {
    const { teamId, ...data } = input
    if (data.slug) {
      data.slug = data.slug.toLowerCase().replace(/\s/g, '-')
      const isSlugUnique = await this.isSlugUnique(data.slug, teamId)
      if (!isSlugUnique) throw createError({ statusCode: 409, statusMessage: 'Slug already in use' })
      if (BLACKLIST_TEAM_SLUGS.includes(data.slug)) {
        throw createError({ statusCode: 409, statusMessage: 'Team slug is blacklisted' })
      }
    }

    return await db.transaction(async (tx: any) => {
      await tx.update(schema.teams)
        .set(data)
        .where(eq(schema.teams.id, teamId))

      const updatedTeam = await tx.query.teams.findFirst({
        where: eq(schema.teams.id, teamId),
        with: {
          members: true,
        }
      })
      if (!updatedTeam) throw createError({ statusCode: 404, statusMessage: `Team not found with id ${teamId}` })

      await clearCache('Team', updatedTeam.id)
      await clearCache('Team', updatedTeam.slug)

      return updatedTeam
    })
  }

  async deleteTeam(input: DeleteTeamInput): Promise<void> {
    const { teamId, slug } = input
    await clearCache('Team', teamId)
    await clearCache('Team', slug)
    const [team] = await db.delete(schema.teams)
      .where(eq(schema.teams.id, teamId))
      .returning({ id: schema.teams.id, slug: schema.teams.slug })
    if (!team) throw createError({ statusCode: 404, statusMessage: `Team not found with id ${teamId}` })
  }

  getTeams = withCache<Team[]>('Teams', async (userId: string) => {
    const memberOf = await db.query.members.findMany({
      where: eq(schema.members.userId, userId),
      with: {
        team: {
          with: {
            members: true
          }
        }
      }
    })
    const teams = memberOf.map((member: { team: Team }) => member.team)
    if (!teams) throw createError({ statusCode: 404, statusMessage: `No teams found for user with id ${userId}` })
    return this.hydrateTeamsUsers(teams)
  })

  getTeam = withCache<Team>('Team', async (slug: string) => {
    const team = await db.query.teams.findFirst({
      where: eq(schema.teams.slug, slug),
      with: {
        members: true
      }
    })
    if (!team) throw createError({ statusCode: 404, statusMessage: `Team not found with slug ${slug}` })
    return this.hydrateTeamUsers(team)
  })

  private isSlugUnique = async (slug: string, teamId?: number): Promise<boolean> => {
    const query = teamId
      ? and(eq(schema.teams.slug, slug), not(eq(schema.teams.id, teamId)))
      : eq(schema.teams.slug, slug)
    const team = await db.query.teams.findFirst({
      where: query
    })
    return !team
  }

  async getTeamBySlug(slug: string): Promise<Team> {
    const team = await db.query.teams.findFirst({
      where: eq(schema.teams.slug, slug),
      with: {
        members: true
      }
    })
    if (!team) throw createError({ statusCode: 404, statusMessage: `Team not found with slug ${slug}` })
    return this.hydrateTeamUsers(team)
  }

}
