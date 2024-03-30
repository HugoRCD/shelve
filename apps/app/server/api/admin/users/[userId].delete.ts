import { H3Event } from 'h3'
import { deleteUser } from '~/server/app/userService'

export default eventHandler(async (event: H3Event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'userId') as string
  if (!id) throw createError({ statusCode: 400, statusMessage: 'missing params' })
  if (user.id === parseInt(id)) throw createError({ statusCode: 400, statusMessage: 'you can\'t delete your own account' })
  await deleteUser(parseInt(id))
  return {
    statusCode: 200,
    message: 'user deleted',
  }
})
