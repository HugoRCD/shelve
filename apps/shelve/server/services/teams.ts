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
    const db = useDrizzle()

    const slug = input.name.toLowerCase().replace(/\s/g, '-')
    const isSlugUnique = await this.isSlugUnique(slug)
    if (!isSlugUnique) {
      throw createError({ statusCode: 409, statusMessage: 'Team name already in use' })
    }
    if (BLACKLIST_TEAM_SLUGS.includes(slug)) {
      throw createError({ statusCode: 409, statusMessage: 'Team slug is blacklisted' })
    }

    const [newTeam] = await db.insert(tables.teams)
      .values({
        slug,
        name: input.name,
        logo: input.logo
      })
      .returning()

    if (!newTeam) {
      throw createError({ statusCode: 422, statusMessage: 'Failed to create team' })
    }

    await db.insert(tables.members)
      .values({
        userId: input.requester.id,
        teamId: newTeam.id,
        role: TeamRole.OWNER
      })

    await new EnvironmentsService().initializeBaseEnvironments(newTeam.id)

    const createdTeam = await db.query.teams.findFirst({
      where: eq(tables.teams.id, newTeam.id),
      with: {
        members: {
          with: {
            user: true
          }
        }
      }
    })

    if (!createdTeam) {
      throw createError({ statusCode: 404, statusMessage: `Team not found with id ${newTeam.id}` })
    }

    await clearCache('Teams', input.requester.id)
    return createdTeam
  }

  async updateTeam(input: UpdateTeamInput): Promise<Team> {
    const { teamId, ...data } = input
    const db = useDrizzle()

    if (data.slug) {
      data.slug = data.slug.toLowerCase().replace(/\s/g, '-')
      const isSlugUnique = await this.isSlugUnique(data.slug, teamId)
      if (!isSlugUnique) {
        throw createError({ statusCode: 409, statusMessage: 'Slug already in use' })
      }
    }

    await db.update(tables.teams)
      .set(data)
      .where(eq(tables.teams.id, teamId))

    const updatedTeam = await db.query.teams.findFirst({
      where: eq(tables.teams.id, teamId),
      with: {
        members: {
          with: {
            user: true
          }
        }
      }
    })

    if (!updatedTeam) {
      throw createError({ statusCode: 404, statusMessage: `Team not found with id ${teamId}` })
    }

    await clearCache('Team', updatedTeam.id)
    await clearCache('Team', updatedTeam.slug)

    return updatedTeam
  }

  async deleteTeam(input: DeleteTeamInput): Promise<void> {
    const { teamId } = input
    await clearCache('Team', teamId)
    const [team] = await useDrizzle().delete(tables.teams)
      .where(eq(tables.teams.id, teamId))
      .returning({ id: tables.teams.id, slug: tables.teams.slug })
    if (!team) throw createError({ statusCode: 404, statusMessage: `Team not found with id ${teamId}` })
  }

  getTeams = withCache<Team[]>('Teams', async (userId: number) => {
    const memberOf = await useDrizzle().query.members.findMany({
      where: eq(tables.members.userId, userId),
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
    const team = await useDrizzle().query.teams.findFirst({
      where: eq(tables.teams.slug, slug),
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
      ? and(eq(tables.teams.slug, slug), not(eq(tables.teams.id, teamId)))
      : eq(tables.teams.slug, slug)
    const team = await useDrizzle().query.teams.findFirst({
      where: query
    })
    return !team
  }

  async getTeamBySlug(slug: string): Promise<Team> {
    const team = await useDrizzle().query.teams.findFirst({
      where: eq(tables.teams.slug, slug),
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

