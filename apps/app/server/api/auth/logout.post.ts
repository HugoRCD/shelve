import { H3Event } from 'h3'
import { deleteSession } from '~~/server/app/sessionService'

export default eventHandler(async (event: H3Event) => {
  const { authToken } = event.context
  deleteCookie(event, 'authToken')
  if (!authToken) {
    return {
      statusCode: 200,
      body: {
        message: 'Logged out',
      },
    }
  }
  await deleteSession(authToken, event.context.user.id)
  return {
    statusCode: 200,
    body: {
      message: 'Logged out',
    },
  }
})
