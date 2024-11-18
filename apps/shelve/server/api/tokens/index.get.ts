import { TokenService } from '~~/server/services/token.service'

export default defineEventHandler((event) => {
  return new TokenService().getTokensByUserId(event.context.user.id)
})
