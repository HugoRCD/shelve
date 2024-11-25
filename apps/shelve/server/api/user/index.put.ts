import { AuthType } from '@shelve/types'
import { zh, z } from 'h3-zod'
import { validateUsername } from '~~/server/services/user'

export default eventHandler(async (event) => {
  const body = await zh.useValidatedBody(event, {
    username: z.string().min(3).max(50).trim().optional(),
    email: z.string().email().trim().optional(),
    avatar: z.string().optional(),
    authType: z.nativeEnum(AuthType).optional(),
  })
  const { user } = await requireUserSession(event)

  if (body.username) body.username = await validateUsername(body.username, body.authType)

  const [updatedUser] = await useDrizzle()
    .update(tables.users)
    .set({
      username: body.username,
      avatar: body.avatar,
    })
    .where(eq(tables.users.id, user.id))
    .returning()
  if (!updatedUser) throw createError({ statusCode: 404, message: 'User not found' })

  await setUserSession(event, {
    user: updatedUser,
    loggedInAt: new Date().toISOString(),
  })
  return updatedUser
})
