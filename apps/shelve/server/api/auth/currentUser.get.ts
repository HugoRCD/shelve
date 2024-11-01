import type { H3Event } from 'h3'
import { getUserByAuthToken } from '~~/server/services/token.service'

export default eventHandler(async (event: H3Event) => {
  const authToken = getCookie(event, 'authToken') || ''

  return await getUserByAuthToken(authToken)
})
