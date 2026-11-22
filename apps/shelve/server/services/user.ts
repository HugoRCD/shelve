import type { H3Event } from 'h3'
import type { CreateUserInput, TokenScopes, User } from '@types'
import { AuthType, Role } from '@types'
import { inArray } from 'drizzle-orm'

async function syncUserRole(user: User, event: H3Event): Promise<User> {
  const adminEmails = useRuntimeConfig(event).private.adminEmails?.split(',').map(e => e.trim()) || []
  const shouldBeAdmin = adminEmails.includes(user.email)
  const currentlyAdmin = user.role === Role.ADMIN

  if (shouldBeAdmin && !currentlyAdmin) {
    const [updatedUser] = await db
      .update(schema.users)
      .set({ role: Role.ADMIN })
      .where(eq(schema.users.id, user.id))
      .returning()
    console.log(`[Auth] Promoted ${user.email} to admin`)
    return updatedUser
  }

  if (!shouldBeAdmin && currentlyAdmin) {
    const [updatedUser] = await db
      .update(schema.users)
      .set({ role: Role.USER })
      .where(eq(schema.users.id, user.id))
      .returning()
    console.log(`[Auth] Demoted ${user.email} from admin`)
    return updatedUser
  }

  return user
}

// Length of the `users.username` column.
const USERNAME_MAX_LENGTH = 25

export async function createUser(input: CreateUserInput, event: H3Event): Promise<User> {
  const adminEmails = useRuntimeConfig(event).private.adminEmails?.split(',') || []
  input.username = await getAvailableUsername(input.username)
  const [createdUser] = await db
    .insert(schema.users)
    .values({
      username: input.username,
      email: input.email,
      avatar: input.avatar,
      authType: input.authType,
      role: adminEmails.includes(input.email) ? Role.ADMIN : undefined,
    })
    .returning()
  if (!createdUser) throw createError({ statusCode: 422, statusMessage: 'Failed to create user' })
  await new EmailService(event).sendWelcomeEmail(input.email, input.username)
  return createdUser
}

/**
 * Resolves the user for an OAuth login. The provider account ID is the stable
 * identity: provider emails can change, so email is only used to link an
 * existing user the first time a provider account is seen.
 *
 * Linking by email, creating a user and granting admin by email all trust the
 * email, so they need one the provider has verified. Returns null when the
 * provider account isn't linked yet and its email isn't verified.
 */
export async function handleOAuthUser(input: CreateUserInput & { emailVerified: boolean }, event: H3Event): Promise<User | null> {
  const { providerAccountId, authType } = input

  if (providerAccountId) {
    const [linked] = await db
      .select({ user: schema.users })
      .from(schema.accounts)
      .innerJoin(schema.users, eq(schema.accounts.userId, schema.users.id))
      .where(and(
        eq(schema.accounts.provider, authType),
        eq(schema.accounts.providerAccountId, providerAccountId),
      ))

    if (linked) return await syncUserRole(linked.user, event)
  }

  if (!input.emailVerified) return null

  const [foundUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, input.email))

  const user = foundUser ?? await createUser(input, event)

  if (providerAccountId) {
    await db
      .insert(schema.accounts)
      .values({ userId: user.id, provider: authType, providerAccountId })
      .onConflictDoNothing()
  }

  return foundUser ? await syncUserRole(foundUser, event) : user
}

export async function handleEmailUser(email: string, event: H3Event): Promise<{ user: User; isNewUser: boolean }> {
  const [foundUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))

  if (foundUser) {
    const syncedUser = await syncUserRole(foundUser, event)
    return { user: syncedUser, isNewUser: false }
  }

  const userInput: CreateUserInput = {
    email,
    username: email.split('@')[0]!,
    authType: AuthType.EMAIL,
    avatar: 'https://i.imgur.com/6VBx3io.png',
  }

  const newUser = await createUser(userInput, event)
  return { user: newUser, isNewUser: true }
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

/**
 * A username for a new account: the requested one when it's free, otherwise a variant
 * with a random suffix. Sign-up never fails on, or reveals, a name someone else has.
 */
async function getAvailableUsername(username: string): Promise<string> {
  const name = username.slice(0, USERNAME_MAX_LENGTH)
  const [taken] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.username, name))
  return taken ? generateUniqueUsername(name) : name
}

export async function authenticateToken(
  rawToken: string,
  event: H3Event
): Promise<{ user: User; scopes: TokenScopes; token: { id: number; prefix: string; name: string } }> {
  if (!rawToken || !rawToken.startsWith('she_')) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }

  const hash = hashToken(rawToken)
  const token = await db.query.tokens.findFirst({
    where: eq(schema.tokens.hash, hash),
  })
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Invalid token' })

  if (token.expiresAt && token.expiresAt.getTime() < Date.now()) {
    throw createError({ statusCode: 401, statusMessage: 'Token expired' })
  }

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
    .set({ lastUsedAt: new Date(), lastUsedIp: ip })
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
