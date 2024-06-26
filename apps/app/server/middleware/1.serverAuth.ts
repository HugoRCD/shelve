import { H3Event } from 'h3'
import { getUserByAuthToken, verifyUserToken } from '~~/server/app/userService'

export default defineEventHandler(async (event: H3Event) => {
  const protectedRoutes = [
    '/api/auth/logout',
    '/api/user',
    '/api/team',
    '/api/project',
    '/api/variable',
    '/api/admin'
  ]

  if (!protectedRoutes.some((route) => event.path?.startsWith(route))) {
    return
  }

  const authToken = getCookie(event, 'authToken')
  if (!authToken) {
    return sendError(
      event,
      createError({
        statusCode: 401,
        statusMessage: 'unauthorized',
      }),
    )
  }
  event.context.authToken = authToken

  const user = await getUserByAuthToken(authToken)
  if (!user) {
    deleteCookie(event, 'authToken')
    return sendError(
      event,
      createError({
        statusCode: 401,
        statusMessage: 'unauthorized',
      }),
    )
  }

  const isTokenValid = await verifyUserToken(authToken, user)
  if (!isTokenValid) {
    deleteCookie(event, 'authToken')
    return sendError(
      event,
      createError({
        statusCode: 401,
        statusMessage: 'unauthorized',
      }),
    )
  }

  event.context.user = user
})
