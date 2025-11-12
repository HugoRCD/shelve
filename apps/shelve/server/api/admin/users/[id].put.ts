import { z } from 'zod'
import { Role } from '@types'
import { idParamsSchema } from '~~/server/database/zod'
import { requireAdmin } from '~~/server/utils/auth'

export default eventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const { id } = await getValidatedRouterParams(event, idParamsSchema.parse)
  const { role } = await readValidatedBody(event, z.object({
    role: z.enum(Role),
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
