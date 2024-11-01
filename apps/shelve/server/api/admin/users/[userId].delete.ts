import type { H3Event } from 'h3'
import { UserService } from '~~/server/services/user.service'

export default eventHandler(async (event: H3Event) => {
  const userService = new UserService()
  const { user } = event.context
  const id = getRouterParam(event, 'userId') as string
  if (!id) throw createError({ statusCode: 400, statusMessage: 'missing params' })
  if (user.id === parseInt(id)) throw createError({ statusCode: 400, statusMessage: 'you can\'t delete your own account' })
  await userService.deleteUser(parseInt(id))
  return {
    statusCode: 200,
    message: 'user deleted',
  }
})
