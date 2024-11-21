import { UserService } from '~~/server/services/user.service'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  await new UserService().deleteUserById(user.id)
  return {
    statusCode: 200,
    message: 'User deleted',
  }
})
