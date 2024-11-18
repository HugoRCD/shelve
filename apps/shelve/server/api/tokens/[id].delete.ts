import { z, zh } from 'h3-zod'
import { TokenService } from '~~/server/services/token.service'

export default defineEventHandler(async (event) => {
  const params = await zh.useValidatedParams(event, {
    id: z.number({
      required_error: 'Cannot delete token without id'
    })
  })
  await new TokenService().deleteUserToken(params.id, event.context.user.id)
})
