import type { H3Event } from 'h3'
import { TokenService } from '~~/server/services/token.service'

export default defineEventHandler((event: H3Event) => {
  const tokenService = new TokenService()
  const { user } = event.context

  return tokenService.getTokensByUserId(user.id)
})
