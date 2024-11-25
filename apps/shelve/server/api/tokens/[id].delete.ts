import { zh } from 'h3-zod'
import { idParamsSchema } from '~~/server/database/zod'

export default defineEventHandler(async (event) => {
  const { id } = await zh.useValidatedParams(event, idParamsSchema)
  const { user } = await requireUserSession(event)
  const [deletedToken] = await useDrizzle().delete(tables.tokens)
    .where(
      and(
        eq(tables.tokens.id, id),
        eq(tables.tokens.userId, user.id)
      )
    )
    .returning()

  if (!deletedToken) throw new Error(`Token not found with id ${id}`)
  return deletedToken
})
