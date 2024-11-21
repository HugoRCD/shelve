import { AuthType } from '@shelve/types'
import { zh, z } from 'h3-zod'
import { UserService } from '~~/server/services/user.service'

export default eventHandler(async (event) => {
  const body = await zh.useValidatedBody(event, {
    username: z.string().min(3).max(50).trim().optional(),
    email: z.string().email().trim().optional(),
    avatar: z.string().optional(),
    authType: z.nativeEnum(AuthType).optional(),
  })
  const { user } = await requireUserSession(event)
  const updatedUser = await new UserService().updateUser(user, {
    id: user.id,
    ...body,
  })
  await setUserSession(event, {
    user: updatedUser,
    loggedInAt: new Date().toISOString(),
  })
  return updatedUser
})
