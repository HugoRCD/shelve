import type { H3Event } from 'h3'
import { createToken } from '~~/server/services/token.service'

export default defineEventHandler(async (event: H3Event) => {
  const { user } = event.context
  const body = await readBody(event)

  return createToken({ name: body.name, userId: user.id })
})
