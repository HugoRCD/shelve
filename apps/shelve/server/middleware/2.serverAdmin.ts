import { Role } from '@shelve/types'

export default defineEventHandler(async (event) => {
  const protectedRoutes = ['/api/admin']

  const { user } = await requireUserSession(event)

  if (protectedRoutes.some((route) => event.path?.startsWith(route)) && (!user || user.role !== Role.ADMIN)) {
    return sendError(
      event,
      createError({
        statusCode: 401,
        statusMessage: 'insufficient permissions',
      }),
    )
  }
})
