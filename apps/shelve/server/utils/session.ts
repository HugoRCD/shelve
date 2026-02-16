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

export async function getShelveSession(event: H3Event): Promise<AppSession | null> {
  if (typeof event.context.shelveSession !== 'undefined') {
    return event.context.shelveSession
  }

  const session = await getUserSession(event)
  if (session) {
    // Better Auth session types don't include Shelve-specific user fields (role, onboarding, ...).
    const rows = await db.select()
      .from(schema.user)
      .where(eq(schema.user.id, session.user.id))
      .limit(1)
    const user = rows[0] ?? null
    const appUser = toAppUser(user)

    if (appUser) {
      const appSession: AppSession = { user: appUser, session: session.session, source: 'session' }
      event.context.shelveSession = appSession
      return appSession
    }
  }

  const authToken = getCookie(event, 'authToken')
  if (!authToken) {
    event.context.shelveSession = null
    return null
  }

  const appSession: AppSession = {
    user: await getUserByAuthToken(authToken, event),
    session: null,
    source: 'token',
  }
  event.context.shelveSession = appSession
  return appSession
}

export async function requireAppSession(event: H3Event): Promise<AppSession> {
  const session = await getShelveSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }
  return session
}
