import { H3Event } from 'h3'
import type { UpdateUserInput } from '@shelve/types'
import { updateUser } from '~~/server/app/userService'

export default eventHandler(async (event: H3Event) => {
  const { user } = event.context
  const { authToken } = event.context
  const updateUserInput = await readBody(event) as UpdateUserInput
  updateUserInput.username = updateUserInput.username?.trim()
  updateUserInput.email = updateUserInput.email?.trim()
  return await updateUser(user, updateUserInput, authToken)
})
