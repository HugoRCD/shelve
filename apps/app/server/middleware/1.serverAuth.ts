import { H3Event } from 'h3'

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

  const session = await requireUserSession(event)

  event.context.user = session.user
})
