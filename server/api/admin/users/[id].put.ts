import { z } from 'zod'
import { Role } from '~~/packages/types'
import { idParamsSchema } from '~~/server/database/zod'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { id } = await getValidatedRouterParams(event, idParamsSchema.parse)
  const { role } = await readValidatedBody(event, z.object({
    role: z.nativeEnum(Role),
  }).parse)
  if (user.id === id) throw createError({ statusCode: 403, statusMessage: 'You can\'t update your own role' })
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
