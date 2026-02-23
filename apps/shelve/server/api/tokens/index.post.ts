import { randomBytes } from 'node:crypto'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const { name } = await readValidatedBody(event, z.object({
    name: z.string({
      error: 'Cannot create token without name',
    }).min(3).max(50).trim(),
  }).parse)
  const { user } = await requireAppSession(event)
  const { encryptionKey } = useRuntimeConfig(event).private

  const createdToken = generateUserToken(user.id)
  const encryptedToken = await seal(createdToken, encryptionKey)

  const [token] = await db.insert(schema.tokens)
    .values({
      token: encryptedToken,
      userId: user.id,
      name
    })
    .returning()

  return token
})

function generateUserToken(userId: string): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = randomBytes(TOKEN_LENGTH)
  let token = ''

  for (const value of bytes) {
    token += characters[value % characters.length]
  }

  return `${TOKEN_PREFIX}${userId}_${token}`
}
