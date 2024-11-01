import type { H3Event } from 'h3'
import { TokenService } from '~~/server/services/token.service'

export default eventHandler(async (event: H3Event) => {
  const tokenService = new TokenService()
  const authToken = getCookie(event, 'authToken') || ''

  return await tokenService.getUserByAuthToken(authToken)
})
