import { z } from 'zod'
import { Role } from '@types'
import { idParamsSchema } from '~~/server/database/zod'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { id } = await getValidatedRouterParams(event, idParamsSchema.parse)
  const { role } = await readValidatedBody(event, z.object({
    role: z.nativeEnum(Role),
  }).parse)
  if (user.id === id) throw createError({ statusCode: 403, statusMessage: 'You can\'t update your own role' })
  await db.update(schema.users)
    .set({
      role
    })
    .where(eq(schema.users.id, id))
  return {
    statusCode: 200,
    message: 'user updated',
  }
})
