import { z } from 'zod'
import { Role } from '@types'
import { userIdParamsSchema } from '~~/server/db/zod'

export default eventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const { id } = await getValidatedRouterParams(event, userIdParamsSchema.parse)
  const { role } = await readValidatedBody(event, z.object({
    role: z.enum(Role),
  }).parse)
  if (user.id === id) throw createError({ statusCode: 403, statusMessage: 'You can\'t update your own role' })
  await db.update(schema.user)
    .set({
      role
    })
    .where(eq(schema.user.id, id))
  return {
    statusCode: 200,
    message: 'user updated',
  }
})
