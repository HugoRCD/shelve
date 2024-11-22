import { zh, z } from 'h3-zod'
import { Role } from '@shelve/types'
import { idParamsSchema } from '~~/server/database/zod'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { id } = await zh.useValidatedParams(event, idParamsSchema)
  const { role } = await zh.useValidatedBody(event, {
    role: z.nativeEnum(Role),
  })
  if (user.id === id) throw createError({ statusCode: 400, statusMessage: 'you can\'t update your own role' })
  await useDrizzle().update(tables.users)
    .set({
      role
    })
    .where(eq(tables.users.id, id))
  return {
    statusCode: 200,
    message: 'user updated',
  }
})
