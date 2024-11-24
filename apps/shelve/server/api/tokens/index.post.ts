import { z, zh } from 'h3-zod'

export default defineEventHandler(async (event) => {
  const { name } = await zh.useValidatedBody(event, {
    name: z.string({
      required_error: 'Cannot create token without name',
    }).min(3).max(50).trim(),
  })
  const { user } = await requireUserSession(event)
  const { encryptionKey } = useRuntimeConfig().private

  const createdToken = generateUserToken(user.id)
  const encryptedToken = await seal(createdToken, encryptionKey)

  const [token] = await useDrizzle().insert(tables.tokens)
    .values({
      token: encryptedToken,
      userId: user.id,
      name
    })
    .returning()

  return token
})

function generateUserToken(userId: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  const userIdHash = calculateUserIdHash(userId)

  for (let i = 0; i < TOKEN_LENGTH; i++) {
    const randomIndex = (Math.floor(Math.random() * characters.length) + userIdHash) % characters.length
    token += characters.charAt(randomIndex)
  }

  return `${TOKEN_PREFIX}${userId}_${token}`
}

function calculateUserIdHash(userId: number): number {
  return Array.from(String(userId)).reduce((acc, char) => acc + char.charCodeAt(0), 0)
}
