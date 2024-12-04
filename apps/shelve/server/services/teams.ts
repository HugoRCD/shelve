import type {
  Team,
  CreateTeamInput,
  DeleteTeamInput,
  UpdateTeamInput,
} from '@shelve/types'
import { TeamRole } from '@shelve/types'
import { EnvironmentsService } from './environments'

export class TeamsService {

  async createTeam(input: CreateTeamInput): Promise<Team> {
    const db = useDrizzle()

    const team = await db.transaction(async (tx) => {
      const slug = input.name.toLowerCase().replace(/\s/g, '-')

      const [newTeam] = await tx.insert(tables.teams)
        .values({
          slug,
          name: input.name,
          logo: input.logo
        })
        .returning()

      if (!newTeam) {
        throw new Error('Failed to create team')
      }

      await tx.insert(tables.members)
        .values({
          userId: input.requester.id,
          teamId: newTeam.id,
          role: TeamRole.OWNER
        })

      return newTeam
    })

    await new EnvironmentsService().initializeBaseEnvironments(team.id)

    const createdTeam = await db.query.teams.findFirst({
      where: eq(tables.teams.id, team.id),
      with: {
        members: {
          with: {
            user: true
          }
        }
      }
    })

    if (!createdTeam) throw new Error(`Team not found after creation with id ${team.id}`)
    await clearCache('Teams', input.requester.id)
    return createdTeam
  }

  async updateTeam(input: UpdateTeamInput): Promise<Team> {
    const { teamId, ...data } = input
    const db = useDrizzle()

    return await db.transaction(async (tx) => {
      await tx.update(tables.teams)
        .set(data)
        .where(eq(tables.teams.id, teamId))

      const updatedTeam = await tx.query.teams.findFirst({
        where: eq(tables.teams.id, teamId),
        with: {
          members: {
            with: {
              user: true
            }
          },
        }
      })
      if (!updatedTeam) throw new Error(`Team not found with id ${teamId}`)

      await clearCache('Team', teamId)

      return updatedTeam
    })
  }

  async deleteTeam(input: DeleteTeamInput): Promise<void> {
    const { teamId } = input
    const [team] = await useDrizzle().delete(tables.teams)
      .where(eq(tables.teams.id, teamId))
      .returning({ id: tables.teams.id, slug: tables.teams.slug })
    if (!team) throw new Error(`Team not found after deletion with id ${teamId}`)
    await clearCache('Team', teamId)
  }

  getTeams = withCache<Team[]>('Teams', async (userId) => {
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
    if (!teams) throw new Error(`Teams not found for user with id ${userId}`)
    return teams
  })

  getTeam = withCache<Team>('Team', async (teamId) => {
    const team = await useDrizzle().query.teams.findFirst({
      where: eq(tables.teams.id, teamId),
      with: {
        members: {
          with: {
            user: true
          }
        }
      }
    })
    if (!team) throw new Error(`Team not found with id ${teamId}`)
    return team
  })

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
    if (!team) throw new Error(`Team not found with slug ${slug}`)
    return team
  }

}

