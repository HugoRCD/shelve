import type { CreateUserInput } from '@shelve/types'
import { H3Event } from 'h3'
import { upsertUser } from '~~/server/app/userService'

export default eventHandler(async (event: H3Event) => {
  const body = await readBody(event) as CreateUserInput
  return await upsertUser(body)
})
