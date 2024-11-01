import type { H3Event } from 'h3'
import type { UpdateUserInput } from '@shelve/types'
import { updateUser } from '~~/server/services/user.service'

export default eventHandler(async (event: H3Event) => {
  const { user } = event.context
  const { authToken } = event.context
  const updateUserInput = await readBody(event) as UpdateUserInput
  updateUserInput.username = updateUserInput.username?.trim()
  updateUserInput.email = updateUserInput.email?.trim()
  const updatedUser = await updateUser(user, updateUserInput, authToken)
  await setUserSession(event, {
    user: {
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
    },
    loggedInAt: new Date().toISOString(),
  })
  return updatedUser
})
