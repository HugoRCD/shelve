import { z, zh } from 'h3-zod'
import { TokenService } from '~~/server/services/token.service'

export default defineEventHandler(async (event) => {
  const { token } = await zh.useValidatedParams(event, {
    token: z.string({
      required_error: 'Cannot get token without token'
    }).trim()
  })
  return new TokenService().getUserByAuthToken(token)
})
