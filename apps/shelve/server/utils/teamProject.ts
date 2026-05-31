import type { H3Event } from 'h3'
import type { Member, Project, Team, User } from '@types'
import { TeamRole } from '@types'
import { projectIdParamsSchema } from '../db/zod'
import { ProjectsService } from '../services/projects'
import { getTeamSlugFromEvent, requireUserTeam } from './auth'

/**
 * Requires team membership and that the route's projectId belongs to that team.
 * Use on all handlers under /api/teams/[slug]/projects/[projectId]/.
 */
export async function requireUserTeamProject(
  event: H3Event,
  options?: { minRole?: TeamRole }
): Promise<{ user: User; team: Team; member: Member; project: Project }> {
  const slug = await getTeamSlugFromEvent(event)
  const { user, team, member } = await requireUserTeam(event, slug, options)
  const { projectId } = await getValidatedRouterParams(event, projectIdParamsSchema.parse)
  const project = await new ProjectsService().getProjectForTeam(projectId, team.id)
  return { user, team, member, project }
}
