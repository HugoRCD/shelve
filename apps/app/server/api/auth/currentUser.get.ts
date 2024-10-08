import { H3Event } from 'h3'
import { getUserByAuthToken } from '~~/server/app/tokenService'

export default eventHandler(async (event: H3Event) => {
  const authToken = getCookie(event, 'authToken') || ''

  return await getUserByAuthToken(authToken)
})
