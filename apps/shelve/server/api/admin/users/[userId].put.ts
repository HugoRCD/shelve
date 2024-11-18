import { zh, z } from 'h3-zod'
import { Role } from '@shelve/types'

export default eventHandler(async (event) => {
  const { userId } = await zh.useValidatedParams(event, {
    userId: z.string({
      required_error: 'User ID is required',
    }).transform((value) => parseInt(value, 10)),
  })
  const { role } = await zh.useValidatedBody(event, {
    role: z.nativeEnum(Role),
  })
  const { user } = event.context
  if (user.id === userId) throw createError({ statusCode: 400, statusMessage: 'you can\'t update your own role' })

  await db.update(tables.users)
    .set({
      role
    })
    .where(eq(tables.users.id, userId))
  return {
    statusCode: 200,
    message: 'user updated',
  }
})
