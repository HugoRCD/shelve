import type { H3Event } from 'h3'
import type { Member, Team, ApiKeyPermission, ApiKeyScopes, User } from '@types'
import { Role, TeamRole } from '@types'
import { checkBotId } from 'botid/server'
import { z } from 'zod'
import { validateTeamAccess, validateTeamRole } from './validateAccess'

const teamSlugSchema = z.object({
  slug: z.string({
    error: 'Team slug is required',
  }).min(1),
})

/** The API key that authenticated the request. */
export type AuthApiKey = {
  id: number
  start: string
  name: string
  scopes: ApiKeyScopes
}

/**
 * Who is making the request. `apiKey` is null for a web session, which has the user's full access.
 * Every route reads auth through `getAuth`/`requireAuth`, so the session library behind it can change in one place.
 */
export type AuthContext = {
  user: User
  apiKey: AuthApiKey | null
}

declare module 'h3' {
  interface H3EventContext {
    /** The request's auth once resolved: the auth middleware sets it for API keys, `getAuth` for sessions. `null` is anonymous. */
    auth?: AuthContext | null
  }
}

type SessionUser = {
  id: string
  name: string
  email: string
  image?: string | null
  role?: string | null
  authType?: string | null
  onboarding?: boolean | null
  cliInstalled?: boolean | null
  createdAt: Date
  updatedAt: Date
}

/** Better Auth's user, with its string ID and field names, as the `User` the rest of Shelve uses. */
export function toShelveUser(user: SessionUser): User {
  return {
    id: Number(user.id),
    username: user.name,
    email: user.email,
    avatar: user.image ?? DEFAULT_AVATAR,
    role: user.role === Role.ADMIN ? Role.ADMIN : Role.USER,
    authType: (user.authType ?? 'email') as User['authType'],
    onboarding: !!user.onboarding,
    cliInstalled: !!user.cliInstalled,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

/** Returns the request's auth, or null when it is anonymous. Reads the Better Auth session once per request. */
export async function getAuth(event: H3Event): Promise<AuthContext | null> {
  if (event.context.auth !== undefined) return event.context.auth
  const { headers, response } = await useServerAuth().api.getSession({ headers: event.headers, returnHeaders: true })
  // Better Auth refreshes the session cookie as the session nears expiry.
  forwardAuthCookies(event, headers)
  event.context.auth = response ? { user: toShelveUser(response.user as SessionUser), apiKey: null } : null
  return event.context.auth
}

/** The GitHub token of the user's web session, or undefined when they did not sign in with GitHub. API keys never carry one. */
export async function getGithubToken(event: H3Event): Promise<string | undefined> {
  const auth = await getAuth(event)
  if (!auth || auth.apiKey) return
  const userId = String(auth.user.id)
  const betterAuth = useServerAuth()
  const accounts = await (await betterAuth.$context).internalAdapter.findAccounts(userId)
  const github = accounts.find(account => account.providerId === 'github')
  if (!github) return
  // Decrypts the stored token, which `account.encryptOAuthTokens` keeps encrypted in the database.
  const { accessToken } = await betterAuth.api.getAccessToken({ body: { accountId: github.id, userId } }).catch(() => ({ accessToken: undefined }))
  return accessToken || undefined
}

/** @throws {Error} 401 when the request is anonymous */
export async function requireAuth(event: H3Event): Promise<AuthContext> {
  const auth = await getAuth(event)
  if (!auth) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  return auth
}

/**
 * Runs the BotID challenge check, only enforced on production deployments.
 *
 * Previews sit behind Vercel Deployment Protection, which intercepts the BotID
 * challenge requests and redirects them to the SSO login. The challenge can never
 * be solved there, so every request would be classified as a bot.
 * @throws {Error} If the request is classified as a bot
 */
export async function requireHuman(): Promise<void> {
  const verification = await checkBotId({
    developmentOptions: {
      isDevelopment: process.env.VERCEL_ENV !== 'production',
      bypass: 'HUMAN',
    },
  })

  if (verification.isBot) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Your browser was flagged as automated. Disable extensions or VPN and try again, or sign in with GitHub or Google.',
    })
  }
}

/**
 * Requires the user to be authenticated and have ADMIN role
 * @throws {Error} If user is not authenticated or not an admin
 */
export async function requireAdmin(event: H3Event): Promise<{ user: User }> {
  const { user } = await requireAuth(event)

  // Read the role from the database: the session cookie keeps the role the user had when they signed in.
  const current = await db.query.users.findFirst({
    where: eq(schema.users.id, user.id),
    columns: { role: true },
  })
  if (current?.role !== Role.ADMIN) {
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
 * @param options.teamWide - Whether the route acts on the whole team (default). Tokens restricted to
 * specific projects or environments are refused, so routes that enforce those scopes themselves pass `false`.
 * @returns Object containing user, team, and member
 * @throws {Error} If user is not authenticated, doesn't belong to team, doesn't have required role, or the token doesn't cover the team
 */
export async function requireUserTeam(
  event: H3Event,
  teamSlug: string,
  options?: { minRole?: TeamRole; teamWide?: boolean }
): Promise<{ user: User; team: Team; member: Member }> {
  const { user } = await requireAuth(event)

  const { team, member } = await validateTeamAccess({ user, teamSlug })

  if (options?.minRole) {
    validateTeamRole(member, options.minRole)
  }

  const teamWide = options?.teamWide ?? true
  await requireApiKeyScope(event, {
    permission: getRequestPermission(event),
    teamId: team.id,
    allProjects: teamWide,
    allEnvironments: teamWide,
  })

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
 * Returns the scopes of the token that authenticated the request, or null when
 * authenticated via web (browser cookie session = full access for the user).
 */
export async function getApiKeyScopes(event: H3Event): Promise<ApiKeyScopes | null> {
  return (await getAuth(event))?.apiKey?.scopes ?? null
}

/**
 * Returns the ids a token is restricted to for one kind of resource, or null when
 * the token isn't restricted on it (or the request uses a web session).
 * Use it to filter lists down to what the token may see.
 */
export async function getApiKeyScopeIds(
  event: H3Event,
  scope: 'teamIds' | 'projectIds' | 'environmentIds'
): Promise<number[] | null> {
  const ids = (await getApiKeyScopes(event))?.[scope]
  return ids?.length ? ids : null
}

/** Reads need the `read` permission, every other method needs `write`. */
export function getRequestPermission(event: H3Event): ApiKeyPermission {
  return event.method === 'GET' || event.method === 'HEAD' ? 'read' : 'write'
}

/**
 * Enforce a token's scopes against the resource being accessed.
 * No-op when the request is authenticated via web session.
 *
 * Throws 403 if:
 * - The required permission (`read`/`write`) is not granted.
 * - The token is restricted to specific teams/projects/envs and the resource is not in scope.
 * - The action spans every project (`allProjects`) or environment (`allEnvironments`) and the token is restricted to some.
 */
export async function requireApiKeyScope(
  event: H3Event,
  resource: {
    teamId?: number
    projectId?: number
    environmentId?: number
    allProjects?: boolean
    allEnvironments?: boolean
    permission: ApiKeyPermission
  }
): Promise<void> {
  const scopes = await getApiKeyScopes(event)
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

  if (resource.allProjects && scopes.projectIds?.length) {
    throw createError({ statusCode: 403, statusMessage: 'Token is restricted to specific projects' })
  }

  if (resource.allEnvironments && scopes.environmentIds?.length) {
    throw createError({ statusCode: 403, statusMessage: 'Token is restricted to specific environments' })
  }
}
