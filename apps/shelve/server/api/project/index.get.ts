import type { H3Event } from 'h3'
import { getProjectsByUserId } from '~~/server/services/project.service'

export default eventHandler(async (event: H3Event) => {
  const { user } = event.context
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })
  return await getProjectsByUserId(user.id)
})
