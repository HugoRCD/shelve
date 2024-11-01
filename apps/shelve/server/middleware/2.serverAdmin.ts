import type { H3Event } from 'h3'
import { Role } from '@shelve/types'

export default defineEventHandler((event: H3Event) => {
  const protectedRoutes = ['/api/admin']

  const { user } = event.context

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
