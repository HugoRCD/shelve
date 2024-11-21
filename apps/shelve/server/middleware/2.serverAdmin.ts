import { Role } from '@shelve/types'

export default defineEventHandler(async (event) => {
  const protectedRoutes = ['/api/admin']

  if (!protectedRoutes.some((route) => event.path?.startsWith(route))) return

  const { user } = await requireUserSession(event)

  if (user.role !== Role.ADMIN) {
    return sendError(
      event,
      createError({
        statusCode: 401,
        statusMessage: 'insufficient permissions',
      }),
    )
  }
})
