import type { H3Event } from 'h3'
import type { AuthSession } from '#nuxt-better-auth'
import type { User } from '@types'

export type AppSession = {
  user: User
  session: AuthSession | null
  source: 'session' | 'token'
}

export async function getAppSession(event: H3Event): Promise<AppSession | null> {
  const session = await getUserSession(event)
  if (session) return { ...session, source: 'session' }

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
