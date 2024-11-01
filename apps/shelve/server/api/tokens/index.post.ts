import type { H3Event } from 'h3'
import { TokenService } from '~~/server/services/token.service'

export default defineEventHandler(async (event: H3Event) => {
  const tokenService = new TokenService()
  const { user } = event.context
  const body = await readBody(event)

  return tokenService.createToken({ name: body.name, userId: user.id })
})
