import { zh, z } from 'h3-zod'
import { UserService } from '~~/server/services/user.service'

export default eventHandler(async (event) => {
  const { user } = event.context
  const { userId } = await zh.useValidatedParams(event, {
    userId: z.string({
      required_error: 'userId is required',
    }).transform((value) => parseInt(value, 10)),
  })
  if (user.id === userId) throw createError({ statusCode: 400, statusMessage: 'you can\'t delete your own account' })
  await new UserService().deleteUserById(userId)
  return {
    statusCode: 200,
    message: 'user deleted',
  }
})
