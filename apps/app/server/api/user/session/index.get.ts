import { H3Event } from 'h3'
import { getSessions } from '~/server/app/sessionService'

export default eventHandler(async (event: H3Event) => {
  const authToken = event.context.authToken
  const user = event.context.user
  return await getSessions(user.id, authToken) || []
})
