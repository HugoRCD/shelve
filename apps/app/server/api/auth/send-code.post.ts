import type { UserCreateInput } from '@shelve/types'
import { H3Event } from 'h3'
import { upsertUser } from '~/server/app/userService'

export default eventHandler(async (event: H3Event) => {
  const body = await readBody(event) as UserCreateInput
  return await upsertUser(body)
})
