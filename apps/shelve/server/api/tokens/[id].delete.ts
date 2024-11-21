import { zh } from 'h3-zod'
import { TokenService } from '~~/server/services/token.service'
import { idParamsSchema } from '~~/server/database/zod'

export default defineEventHandler(async (event) => {
  const { id } = await zh.useValidatedParams(event, idParamsSchema)
  const { user } = await requireUserSession(event)
  await new TokenService().deleteUserToken(id, user.id)
})
