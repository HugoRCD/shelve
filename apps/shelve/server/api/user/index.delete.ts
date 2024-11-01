import type { H3Event } from 'h3'
import { deleteUser } from '~~/server/services/user.service'

export default eventHandler(async (event: H3Event) => {
  const { user } = event.context
  await deleteUser(user.id)
  return {
    statusCode: 200,
    message: 'User deleted',
  }
})
