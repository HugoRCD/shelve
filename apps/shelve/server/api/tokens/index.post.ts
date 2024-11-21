import { z, zh } from 'h3-zod'
import { TokenService } from '~~/server/services/token.service'

export default defineEventHandler(async (event) => {
  const { name } = await zh.useValidatedBody(event, {
    name: z.string({
      required_error: 'Cannot create token without name',
    }).min(3).max(50).trim(),
  })
  const { user } = await requireUserSession(event)
  return new TokenService().createToken({ name: name, userId: user.id })
})
