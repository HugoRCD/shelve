import type { H3Event } from 'h3'
import type { UpdateUserInput } from '@shelve/types'
import { UserService } from '~~/server/services/user.service'

export default eventHandler(async (event: H3Event) => {
  const userService = new UserService()
  const { user } = event.context
  const data = await readBody(event) as UpdateUserInput['data']
  data.username = data.username?.trim()
  data.email = data.email?.trim()
  const updatedUser = await userService.updateUser({
    currentUser: user,
    data,
  })
  await setUserSession(event, {
    user: updatedUser,
    loggedInAt: new Date().toISOString(),
  })
  return updatedUser
})
