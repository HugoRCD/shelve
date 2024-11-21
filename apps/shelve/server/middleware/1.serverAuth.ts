import { TokenService } from '~~/server/services/token.service'

export default defineEventHandler(async (event) => {
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
    const user = await new TokenService().getUserByAuthToken(authToken)
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
    await setUserSession(event, {
      user,
      loggedInAt: new Date().toISOString(),
    })
  }
})
