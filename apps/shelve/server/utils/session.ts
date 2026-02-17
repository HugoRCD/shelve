import type { H3Event } from 'h3'
import type { User } from '@types'
import type { AuthSession } from '#nuxt-better-auth'
import { getUserByApiToken } from '../services/user'

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
  // session: Better Auth session flow, token: API token flow.
  source: 'session' | 'token'
}

function getApiTokenFromAuthorizationHeader(event: H3Event): string | null {
  const header = getHeader(event, 'authorization')
  if (!header) return null

  const [scheme, token] = header.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null

  return token
}

async function getAppUserById(id: string): Promise<User | null> {
  const rows = await db.select().from(schema.user).where(eq(schema.user.id, id)).limit(1)
  return toAppUser(rows[0] ?? null)
}

export async function requireAppSession(event: H3Event): Promise<AppSession> {
  const apiToken = getApiTokenFromAuthorizationHeader(event)
  if (apiToken?.startsWith(TOKEN_PREFIX)) {
    return {
      user: await getUserByApiToken(apiToken, event),
      session: null,
      source: 'token',
    }
  }

  const { user, session } = await requireUserSession(event)
  const appUser = await getAppUserById(user.id)

  if (!appUser) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }

  return {
    user: appUser,
    session,
    source: 'session',
  }
}
