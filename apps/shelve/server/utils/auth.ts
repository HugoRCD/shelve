import type { H3Event } from 'h3'
import type { Member, Team, TokenPermission, TokenScopes, User } from '@types'
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

/**
 * Returns the token scopes attached to the current session, or null when
 * authenticated via web (browser cookie session = full access for the user).
 */
export async function getTokenScopes(event: H3Event): Promise<TokenScopes | null> {
  const session = await getUserSession(event)
  return (session as { tokenScopes?: TokenScopes }).tokenScopes ?? null
}

/**
 * Enforce a token's scopes against the resource being accessed.
 * No-op when the request is authenticated via web session.
 *
 * Throws 403 if:
 * - The required permission (`read`/`write`) is not granted.
 * - The token is restricted to specific teams/projects/envs and the resource is not in scope.
 */
export async function requireTokenScope(
  event: H3Event,
  resource: { teamId?: number; projectId?: number; environmentId?: number; permission: TokenPermission }
): Promise<void> {
  const scopes = await getTokenScopes(event)
  if (!scopes) return

  if (!scopes.permissions.includes(resource.permission)) {
    throw createError({ statusCode: 403, statusMessage: `Token missing '${resource.permission}' permission` })
  }

  if (scopes.teamIds?.length && resource.teamId !== undefined && !scopes.teamIds.includes(resource.teamId)) {
    throw createError({ statusCode: 403, statusMessage: 'Token not authorized for this team' })
  }

  if (scopes.projectIds?.length && resource.projectId !== undefined && !scopes.projectIds.includes(resource.projectId)) {
    throw createError({ statusCode: 403, statusMessage: 'Token not authorized for this project' })
  }

  if (scopes.environmentIds?.length && resource.environmentId !== undefined && !scopes.environmentIds.includes(resource.environmentId)) {
    throw createError({ statusCode: 403, statusMessage: 'Token not authorized for this environment' })
  }
}
