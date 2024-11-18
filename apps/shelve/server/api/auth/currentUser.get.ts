import { TokenService } from '~~/server/services/token.service'

export default eventHandler(async (event) => {
  const tokenService = new TokenService()
  const authToken = getCookie(event, 'authToken') || ''

  return await tokenService.getUserByAuthToken(authToken)
})
