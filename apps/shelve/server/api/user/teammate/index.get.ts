import type { H3Event } from 'h3'
import { getTeammatesByUserId } from '~~/server/services/teammate.service'

export default eventHandler((event: H3Event) => {
  const { user } = event.context
  return getTeammatesByUserId(user.id)
})
