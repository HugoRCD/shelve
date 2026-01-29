import type { CreateTeamInput, DeleteTeamInput, Team, UpdateTeamInput } from '@types'
import { TeamRole } from '@types'

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
  'settings',
  'billing',
  'user',
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

    const team = await db.transaction(async (tx) => {
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
        members: {
          with: {
            user: true
          }
        }
      }
    })

    if (!createdTeam) throw createError({ statusCode: 404, statusMessage: `Team not found with id ${team.id}` })
    await clearCache('Teams', input.requester.id)
    return createdTeam
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

    return await db.transaction(async (tx) => {
      await tx.update(schema.teams)
        .set(data)
        .where(eq(schema.teams.id, teamId))

      const updatedTeam = await tx.query.teams.findFirst({
        where: eq(schema.teams.id, teamId),
        with: {
          members: {
            with: {
              user: true
            }
          },
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

  getTeams = withCache<Team[]>('Teams', async (userId: number) => {
    const memberOf = await db.query.members.findMany({
      where: eq(schema.members.userId, userId),
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
    if (!teams) throw createError({ statusCode: 404, statusMessage: `No teams found for user with id ${userId}` })
    return teams
  })

  getTeam = withCache<Team>('Team', async (slug: string) => {
    const team = await db.query.teams.findFirst({
      where: eq(schema.teams.slug, slug),
      with: {
        members: {
          with: {
            user: true
          }
        }
      }
    })
    if (!team) throw createError({ statusCode: 404, statusMessage: `Team not found with slug ${slug}` })
    return team
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
        members: {
          with: {
            user: true
          }
        }
      }
    })
    if (!team) throw createError({ statusCode: 404, statusMessage: `Team not found with slug ${slug}` })
    return team
  }

}
