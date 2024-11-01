import type { H3Event } from 'h3'
import { getUserByAuthToken } from '~~/server/services/token.service'

export default defineEventHandler(async (event: H3Event) => {
  const protectedRoutes = [
    '/api/auth/logout',
    '/api/user',
    '/api/team',
    '/api/project',
    '/api/variable',
    '/api/tokens',
    '/api/admin',
    '/api/protected',
  ]

  if (!protectedRoutes.some((route) => event.path?.startsWith(route))) {
    return
  }

  const authToken = getCookie(event, 'authToken')

  if (authToken) {
    const user = await getUserByAuthToken(authToken)
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
    event.context.user = user
    return
  }

  const session = await requireUserSession(event)

  event.context.user = session.user
})
