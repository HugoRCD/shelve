import { zh } from 'h3-zod'
import { idParamsSchema } from '~~/server/database/zod'

export default eventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { id } = await zh.useValidatedParams(event, idParamsSchema)
  if (user.id === id) throw createError({ statusCode: 400, statusMessage: 'you can\'t delete your own account' })
  await useDrizzle().delete(tables.users).where(eq(tables.users.id, id))
  return {
    statusCode: 200,
    message: 'user deleted',
  }
})
