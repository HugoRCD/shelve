import type { H3Event } from 'h3'
import { getUserByAuthToken } from '~~/server/services/token.service'

export default defineEventHandler((event: H3Event) => {
  const token = getRouterParam(event, 'token') as string
  if (!token) throw createError({ statusCode: 400, statusMessage: 'Missing params' })

  return getUserByAuthToken(token)
})
