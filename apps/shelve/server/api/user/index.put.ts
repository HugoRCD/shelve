import { z } from 'zod'
import { AuthType } from '@types'

const updateUserSchema = z.object({
  username: z.string().min(3).max(50).trim().optional(),
  email: z.email().trim().optional(),
  avatar: z.string().trim().optional(),
  authType: z.enum(AuthType).optional(),
})

export default eventHandler(async (event) => {
  const body = await readValidatedBody(event, updateUserSchema.parse)
  const { user } = await requireUserSession(event)

  if (body.username) body.username = await validateUsername(body.username, body.authType)

  const [updatedUser] = await db
    .update(schema.users)
    .set({
      username: body.username,
      avatar: body.avatar,
    })
    .where(eq(schema.users.id, user.id))
    .returning()
  if (!updatedUser) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  await setUserSession(event, {
    user: updatedUser,
    loggedInAt: new Date(),
  })
  return updatedUser
})
