import type { H3Event } from 'h3'
import type { Member, Project, Team, User } from '@types'
import { TeamRole } from '@types'
import { projectIdParamsSchema } from '../db/zod'
import { ProjectsService } from '../services/projects'
import { getRequestPermission, getTeamSlugFromEvent, requireTokenScope, requireUserTeam } from './auth'

/**
 * Requires team membership and that the route's projectId belongs to that team.
 * Use on all handlers under /api/teams/[slug]/projects/[projectId]/.
 * @param options.projectWide - Whether the route acts on every environment of the project (default).
 * Tokens restricted to specific environments are refused, so routes that enforce environment scopes themselves pass `false`.
 */
export async function requireUserTeamProject(
  event: H3Event,
  options?: { minRole?: TeamRole; projectWide?: boolean }
): Promise<{ user: User; team: Team; member: Member; project: Project }> {
  const slug = await getTeamSlugFromEvent(event)
  const { user, team, member } = await requireUserTeam(event, slug, { minRole: options?.minRole, teamWide: false })
  const { projectId } = await getValidatedRouterParams(event, projectIdParamsSchema.parse)
  const project = await new ProjectsService().getProjectForTeam(projectId, team.id)
  await requireTokenScope(event, {
    permission: getRequestPermission(event),
    projectId: project.id,
    allEnvironments: options?.projectWide ?? true,
  })
  return { user, team, member, project }
}
