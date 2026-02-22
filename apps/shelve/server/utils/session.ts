import type { H3Event } from 'h3'
import type { User } from '@types'
import type { AuthSession } from '#nuxt-better-auth'
import { getUserByApiToken } from '../services/user'
import { user as userTable } from '../db/schema'

type DbUser = typeof userTable.$inferSelect

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

function isLegacyCliAllowed(): boolean {
  const configValue = process.env.NUXT_AUTH_ALLOW_LEGACY_CLI
  if (typeof configValue === 'boolean') return configValue
  if (typeof configValue === 'string') return configValue.toLowerCase() !== 'false'
  return true
}

function getApiTokenFromAuthorizationHeader(event: H3Event): string | null {
  const header = getHeader(event, 'authorization')
  if (!header) return null

  const [scheme, token] = header.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null

  return token
}

function getApiTokenFromLegacyCookie(event: H3Event): string | null {
  if (!isLegacyCliAllowed()) return null
  const token = getCookie(event, 'authToken')
  if (!token?.startsWith(TOKEN_PREFIX)) return null

  console.info('[auth-compat] accepted legacy authToken cookie for API auth')
  return token
}

function getApiToken(event: H3Event): string | null {
  return getApiTokenFromAuthorizationHeader(event) || getApiTokenFromLegacyCookie(event)
}

async function getAppUserById(id: string): Promise<User | null> {
  const rows = await db.select().from(userTable).where(eq(userTable.id, id)).limit(1)
  return toAppUser(rows[0] ?? null)
}

export async function requireAppSession(event: H3Event): Promise<AppSession> {
  const apiToken = getApiToken(event)
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