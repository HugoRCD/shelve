import type { H3Event } from 'h3'
import type { TokenScopes, User } from '@types'
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

export async function authenticateToken(
  rawToken: string,
  event: H3Event
): Promise<{ user: User; scopes: TokenScopes; token: { id: number; prefix: string; name: string } }> {
  if (!rawToken || !rawToken.startsWith('she_')) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }

  // Better Auth's api-key plugin finds the token by hash, checks that it is enabled and not expired, and records its use.
  const { valid, error, key } = await useServerAuth().api.verifyApiKey({ body: { key: rawToken } })
  if (!valid || !key) {
    throw createError({ statusCode: 401, statusMessage: error?.code === 'KEY_EXPIRED' ? 'Token expired' : 'Invalid token' })
  }
  const token = await db.query.tokens.findFirst({ where: eq(schema.tokens.id, Number(key.id)) })
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Invalid token' })

  const ip = getClientIp(event)
  if (token.allowedCidrs.length > 0) {
    if (!ip || !ip.length) {
      throw createError({ statusCode: 401, statusMessage: 'Token IP allowlist enforced' })
    }
    if (!token.allowedCidrs.some((cidr) => isIpInCidr(ip, cidr))) {
      throw createError({ statusCode: 403, statusMessage: 'IP not allowed for this token' })
    }
  }

  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, token.userId),
    columns: PUBLIC_USER_COLUMNS,
  })
  if (!user) throw createError({ statusCode: 401, statusMessage: 'User not found' })

  const teamIds = await resolveTokenTeamIds(token.scopes)
  if (teamIds && !teamIds.length) {
    throw createError({ statusCode: 403, statusMessage: 'Token has no accessible team' })
  }

  await db.update(schema.tokens)
    .set({ lastUsedIp: ip })
    .where(eq(schema.tokens.id, token.id))

  return {
    user,
    scopes: teamIds ? { ...token.scopes, teamIds } : token.scopes,
    token: { id: token.id, prefix: token.prefix, name: token.name },
  }
}

/**
 * Teams a token can reach, or undefined when it isn't restricted. Project and environment
 * restrictions narrow the teams too: a token limited to one project stays out of the owner's other teams.
 */
async function resolveTokenTeamIds(scopes: TokenScopes): Promise<number[] | undefined> {
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
