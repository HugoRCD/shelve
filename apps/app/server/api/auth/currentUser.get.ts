import { H3Event } from 'h3'
import { getUserByAuthToken, verifyUserToken } from '~~/server/app/userService'

export default eventHandler(async (event: H3Event) => {
  const authToken = getCookie(event, 'authToken')
  if (!authToken) return null
  const user = await getUserByAuthToken(authToken)
  if (!user) return null
  const isTokenValid = await verifyUserToken(authToken, user)
  if (!isTokenValid) return null
  return user
})
