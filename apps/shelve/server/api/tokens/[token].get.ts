import type { H3Event } from 'h3'
import { TokenService } from '~~/server/services/token.service'

export default defineEventHandler((event: H3Event) => {
  const tokenService = new TokenService()
  const token = getRouterParam(event, 'token') as string
  if (!token) throw createError({ statusCode: 400, statusMessage: 'Missing params' })

  return tokenService.getUserByAuthToken(token)
})
