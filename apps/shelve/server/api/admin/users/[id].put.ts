import { z } from 'zod'
import { Role } from '@types'
import { userIdParamsSchema } from '~~/server/db/zod'
import { user as authUser } from '../../../db/schema/better-auth.postgresql'

export default eventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const { id } = await getValidatedRouterParams(event, userIdParamsSchema.parse)
  const { role } = await readValidatedBody(event, z.object({
    role: z.enum(Role),
  }).parse)
  if (user.id === id) throw createError({ statusCode: 403, statusMessage: 'You can\'t update your own role' })
  await db.update(authUser)
    .set({
      role
    })
    .where(eq(authUser.id, id))
  return {
    statusCode: 200,
    message: 'user updated',
  }
})
