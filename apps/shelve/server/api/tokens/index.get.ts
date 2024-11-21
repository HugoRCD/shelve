import { TokenService } from '~~/server/services/token.service'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  return new TokenService().getTokensByUserId(user.id)
})
