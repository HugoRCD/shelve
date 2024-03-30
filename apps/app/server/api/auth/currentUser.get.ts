import { H3Event } from 'h3'
import { getUserByAuthToken } from '~/server/app/userService'

export default eventHandler(async (event: H3Event) => {
  const authToken = getCookie(event, 'authToken')
  if (!authToken) return null
  return await getUserByAuthToken(authToken)
})
