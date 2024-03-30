import { H3Event } from 'h3'
import { deleteSessions } from '~/server/app/sessionService'

export default eventHandler(async (event: H3Event) => {
  const authToken = event.context.authToken
  const user = event.context.user
  await deleteSessions(user.id, authToken)
  return {
    statusCode: 200,
    message: 'sessions deleted',
  }
})
