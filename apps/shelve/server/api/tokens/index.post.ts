import { z, zh } from 'h3-zod'
import { TokenService } from '~~/server/services/token.service'

export default defineEventHandler(async (event) => {
  const body = await zh.useValidatedBody(event, {
    name: z.string({
      required_error: 'Cannot create token without name'
    }).min(3).max(50).trim(),
  })
  return new TokenService().createToken({ name: body.name, userId: event.context.user.id })
})
