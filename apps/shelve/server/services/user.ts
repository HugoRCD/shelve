import type { H3Event } from 'h3'
import type { ApiKeyScopes, User } from '@types'
import { AuthType, Role } from '@types'
import { inArray } from 'drizzle-orm'

/** Sets the user's role from `NUXT_PRIVATE_ADMIN_EMAILS`, promoting or demoting them when it changed. */
export async function syncUserRole(userId: number, adminEmails: string[]): Promise<void> {
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, userId), columns: { email: true, role: true } })
  if (!user) return
  const role = adminEmails.includes(user.email) ? Role.ADMIN : Role.USER
  if (user.role === role) return
  await db.update(schema.users).set({ role }).where(eq(schema.users.id, userId))
  console.log(`[Auth] ${role === Role.ADMIN ? 'Promoted' : 'Demoted'} ${user.email} ${role === Role.ADMIN ? 'to' : 'from'} admin`)
}

// Length of the `users.username` column.
const USERNAME_MAX_LENGTH = 25

/**
 * A free username for a new user, based on their provider login, name or email: taken
 * ones get a random suffix. Sign-up never fails on, or reveals, a name someone else has.
 */
export async function availableUsername(base: string): Promise<string> {
  const name = base.trim().replace(/\s+/g, '_').slice(0, USERNAME_MAX_LENGTH) || 'user'
  const isTaken = async (candidate: string) => (await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.username, candidate))).length > 0

  let candidate = name
  for (let attempt = 0; attempt < 10 && await isTaken(candidate); attempt++) {
    candidate = generateUniqueUsername(name)
  }
  return candidate
}

export async function validateUsername(username: string, authType?: AuthType): Promise<string> {
  const foundUser = await db
    .select({
      username: schema.users.username,
    })
    .from(schema.users)
    .where(eq(schema.users.username, username))

  const usernameTaken = foundUser.length > 0
  const isOAuthUser = authType === AuthType.GITHUB || authType === AuthType.GOOGLE
  if (isOAuthUser && usernameTaken) return generateUniqueUsername(username)
  if (usernameTaken) throw createError({ statusCode: 400, statusMessage: 'Username already taken' })
  return username
}

function generateUniqueUsername(username: string): string {
  const suffix = `_#${Math.floor(Math.random() * 1000)}`
  return `${username.slice(0, USERNAME_MAX_LENGTH - suffix.length)}${suffix}`
}

export async function authenticateApiKey(
  rawKey: string,
  event: H3Event
): Promise<{ user: User; apiKey: { id: number; start: string; name: string; scopes: ApiKeyScopes } }> {
  // The error messages still say "token": the CLI and existing scripts show them as they are.
  if (!rawKey || !rawKey.startsWith(API_KEY_PREFIX)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }

  // Better Auth's api-key plugin finds the key by hash, checks that it is enabled and not expired, and records its use.
  const { valid, error, key } = await useServerAuth().api.verifyApiKey({ body: { key: rawKey } })
  if (!valid || !key) {
    throw createError({ statusCode: 401, statusMessage: error?.code === 'KEY_EXPIRED' ? 'Token expired' : 'Invalid token' })
  }
  const apiKey = await db.query.apiKeys.findFirst({ where: eq(schema.apiKeys.id, Number(key.id)) })
  if (!apiKey) throw createError({ statusCode: 401, statusMessage: 'Invalid token' })

  const ip = getClientIp(event)
  if (apiKey.allowedCidrs.length > 0) {
    if (!ip || !ip.length) {
      throw createError({ statusCode: 401, statusMessage: 'Token IP allowlist enforced' })
    }
    if (!apiKey.allowedCidrs.some((cidr) => isIpInCidr(ip, cidr))) {
      throw createError({ statusCode: 403, statusMessage: 'IP not allowed for this token' })
    }
  }

  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, apiKey.referenceId),
    columns: PUBLIC_USER_COLUMNS,
  })
  if (!user) throw createError({ statusCode: 401, statusMessage: 'User not found' })

  const teamIds = await resolveApiKeyTeamIds(apiKey.scopes)
  if (teamIds && !teamIds.length) {
    throw createError({ statusCode: 403, statusMessage: 'Token has no accessible team' })
  }

  await db.update(schema.apiKeys)
    .set({ lastUsedIp: ip })
    .where(eq(schema.apiKeys.id, apiKey.id))

  return {
    user,
    apiKey: { id: apiKey.id, start: apiKey.start, name: apiKey.name, scopes: teamIds ? { ...apiKey.scopes, teamIds } : apiKey.scopes },
  }
}

/**
 * Teams a token can reach, or undefined when it isn't restricted. Project and environment
 * restrictions narrow the teams too: a token limited to one project stays out of the owner's other teams.
 */
async function resolveApiKeyTeamIds(scopes: ApiKeyScopes): Promise<number[] | undefined> {
  const restrictions: number[][] = []
  if (scopes.teamIds?.length) restrictions.push(scopes.teamIds)

  if (scopes.projectIds?.length) {
    const projects = await db.query.projects.findMany({
      where: inArray(schema.projects.id, scopes.projectIds),
      columns: { teamId: true },
    })
    restrictions.push(projects.map(p => p.teamId))
  }

  if (scopes.environmentIds?.length) {
    const environments = await db.query.environments.findMany({
      where: inArray(schema.environments.id, scopes.environmentIds),
      columns: { teamId: true },
    })
    restrictions.push(environments.map(e => e.teamId))
  }

  if (!restrictions.length) return undefined
  return restrictions.reduce((allowed, teamIds) => allowed.filter(id => teamIds.includes(id)))
}
