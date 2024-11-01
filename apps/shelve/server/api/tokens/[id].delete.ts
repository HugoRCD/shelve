import type { H3Event } from 'h3'
import { TokenService } from '~~/server/services/token.service'

export default defineEventHandler(async (event: H3Event) => {
  const tokenService = new TokenService()
  const { user } = event.context
  const id = getRouterParam(event, 'id') as string

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing params' })

  await tokenService.deleteUserToken(+id, user.id)
})
