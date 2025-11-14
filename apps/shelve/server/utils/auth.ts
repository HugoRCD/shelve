import type { H3Event } from 'h3'
import type { Member, Team, User } from '@types'
import { Role, TeamRole } from '@types'
import { z } from 'zod'
import { validateTeamAccess, validateTeamRole } from './validateAccess'

const teamSlugSchema = z.object({
  slug: z.string({
    error: 'Team slug is required',
  }).min(1),
})

/**
 * Requires the user to be authenticated and have ADMIN role
 * @throws {Error} If user is not authenticated or not an admin
 */
export async function requireAdmin(event: H3Event): Promise<{ user: User }> {
  const { user } = await requireUserSession(event)

  if (user.role !== Role.ADMIN) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Insufficient permissions',
    })
  }

  return { user }
}

/**
 * Requires the user to be authenticated and have access to the team
 * Optionally checks for minimum role requirement
 * @param event - H3 event
 * @param teamSlug - Team slug from route params
 * @param options - Optional configuration
 * @param options.minRole - Minimum role required (OWNER, ADMIN, or MEMBER)
 * @returns Object containing user, team, and member
 * @throws {Error} If user is not authenticated, doesn't belong to team, or doesn't have required role
 */
export async function requireUserTeam(
  event: H3Event,
  teamSlug: string,
  options?: { minRole?: TeamRole }
): Promise<{ user: User; team: Team; member: Member }> {
  const { user } = await requireUserSession(event)

  const { team, member } = await validateTeamAccess({ user, teamSlug })

  if (options?.minRole) {
    validateTeamRole(member, options.minRole)
  }

  return { user, team, member }
}

/**
 * Helper to extract and validate team slug from route parameters
 * Useful for routes under /api/teams/[slug]/
 */
export async function getTeamSlugFromEvent(event: H3Event): Promise<string> {
  const { slug } = await getValidatedRouterParams(event, teamSlugSchema.parse)
  return slug
}
