import { H3Event } from 'h3'
import { createToken } from '~~/server/app/tokenService'

export default defineEventHandler(async (event: H3Event) => {
  const { user } = event.context
  const body = await readBody(event)

  return createToken({ name: body.name, userId: user.id })
})
