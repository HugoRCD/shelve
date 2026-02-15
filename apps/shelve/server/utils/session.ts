import type { H3Event } from 'h3'
import type { User } from '@types'
import type { AuthSession } from '#nuxt-better-auth'

type DbUser = typeof schema.user.$inferSelect

function toAppUser(user: DbUser | null): User | null {
  if (!user) return null

  return {
    id: user.id,
    name: user.name || '',
    email: user.email,
    image: user.image,
    emailVerified: user.emailVerified,
    role: user.role === 'admin' ? 'admin' : 'user',
    authType: user.authType === 'github' || user.authType === 'google' ? user.authType : 'email',
    onboarding: user.onboarding,
    cliInstalled: user.cliInstalled,
    legacyId: user.legacyId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export type AppSession = {
  user: User
  session: AuthSession | null
  // session: Better Auth session flow, token: CLI authToken fallback flow.
  source: 'session' | 'token'
}

export async function getAppSession(event: H3Event): Promise<AppSession | null> {
  if (typeof event.context.appSession !== 'undefined') {
    return event.context.appSession
  }

  const session = await resolveAppSession(event)
  event.context.appSession = session
  return session
}

export async function getCurrentAppSession(event: H3Event): Promise<AppSession | null> {
  return getAppSession(event)
}

async function resolveAppSession(event: H3Event): Promise<AppSession | null> {
  const sessionAuth = await resolveSessionAuth(event)
  if (sessionAuth) {
    return sessionAuth
  }

  return resolveTokenAuth(event)
}

async function resolveSessionAuth(event: H3Event): Promise<AppSession | null> {
  const session = await getUserSession(event)
  if (!session) {
    return null
  }

  // Better Auth session types don't include Shelve-specific user fields (role, onboarding, ...).
  const user = await db.query.user.findFirst({
    where: eq(schema.user.id, session.user.id),
  })
  const appUser = toAppUser(user)
  if (!appUser) return null

  return { user: appUser, session: session.session, source: 'session' }
}

async function resolveTokenAuth(event: H3Event): Promise<AppSession | null> {
  const authToken = getCookie(event, 'authToken')
  if (!authToken) return null

  const user = await getUserByAuthToken(authToken, event)
  return { user, session: null, source: 'token' }
}

export async function requireAppSession(event: H3Event): Promise<AppSession> {
  const session = await getAppSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }
  return session
}
