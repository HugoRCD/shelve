import { UserService } from '~~/server/services/user.service'

export default eventHandler(async (event) => {
  await new UserService().deleteUserById(event.context.user.id)
  return {
    statusCode: 200,
    message: 'User deleted',
  }
})
