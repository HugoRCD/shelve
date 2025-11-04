import { idParamsSchema } from '~~/server/database/zod'

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, idParamsSchema.parse)
  const { user } = await requireUserSession(event)
  const [deletedToken] = await db.delete(schema.tokens)
    .where(
      and(
        eq(schema.tokens.id, id),
        eq(schema.tokens.userId, user.id)
      )
    )
    .returning()

  if (!deletedToken) throw createError({ statusCode: 404, message: `Token not found with id ${id}` })
  return deletedToken
})
