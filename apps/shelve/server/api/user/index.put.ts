import { z } from 'zod'
const updateUserSchema = z.object({
  name: z.string().min(1).max(50).trim().optional(),
  image: z.string().trim().optional(),
})

export default eventHandler(async (event) => {
  const body = await readValidatedBody(event, updateUserSchema.parse)
  const { user } = await requireAppSession(event)

  if (body.name) body.name = await validateUsername(body.name)

  const [updatedUser] = await db
    .update(schema.user)
    .set({
      name: body.name,
      image: body.image,
    })
    .where(eq(schema.user.id, user.id))
    .returning()
  if (!updatedUser) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  return updatedUser
})
