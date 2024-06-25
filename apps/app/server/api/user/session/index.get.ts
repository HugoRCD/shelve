import { H3Event } from 'h3'
import { getSessions } from '~/server/app/sessionService'

export default eventHandler(async (event: H3Event) => {
  const { authToken } = event.context
  const { user } = event.context
  return await getSessions(user.id, authToken) || []
})
