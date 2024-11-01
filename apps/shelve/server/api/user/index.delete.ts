import type { H3Event } from 'h3'
import { UserService } from '~~/server/services/user.service'

export default eventHandler(async (event: H3Event) => {
  const userService = new UserService()
  const { user } = event.context
  await userService.deleteUser(user.id)
  return {
    statusCode: 200,
    message: 'User deleted',
  }
})
