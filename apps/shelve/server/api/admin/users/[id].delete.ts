import { zh } from 'h3-zod'
import { UserService } from '~~/server/services/user.service'
import { idParamsSchema } from '~~/server/database/zod'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { id } = await zh.useValidatedParams(event, idParamsSchema)
  if (user.id === id) throw createError({ statusCode: 400, statusMessage: 'you can\'t delete your own account' })
  await new UserService().deleteUserById(id)
  return {
    statusCode: 200,
    message: 'user deleted',
  }
})
