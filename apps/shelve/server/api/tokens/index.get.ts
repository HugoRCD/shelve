import type { H3Event } from 'h3'
import { getTokensByUserId } from '~~/server/services/token.service'

export default defineEventHandler((event: H3Event) => {
  const { user } = event.context

  return getTokensByUserId(user.id)
})
