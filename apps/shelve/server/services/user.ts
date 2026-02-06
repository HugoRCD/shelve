import type { H3Event } from 'h3'
import type { AuthType, Token, User } from '../../../packages/types'

const LEGACY_ID_REGEX = /^\d+$/
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function validateUsername(username: string, _authType?: AuthType): Promise<string> {
  const trimmed = username.trim()
  if (!trimmed) throw createError({ statusCode: 400, statusMessage: 'Invalid username' })
  return trimmed
}

function parseTokenId(authToken: string): { userId?: string; legacyId?: number } {
  if (!authToken.startsWith(TOKEN_PREFIX)) return {}
  const parts = authToken.split('_')
  if (parts.length < 3) return {}
  const idPart = parts[1]

  if (UUID_REGEX.test(idPart)) return { userId: idPart }
  if (LEGACY_ID_REGEX.test(idPart)) return { legacyId: Number(idPart) }
  return {}
}

export async function getUserByAuthToken(authToken: string, event: H3Event): Promise<User> {
  const { encryptionKey } = useRuntimeConfig(event).private
  const { userId, legacyId } = parseTokenId(authToken)

  let user: User | undefined

  if (userId) {
    user = await db.query.user.findFirst({
      where: eq(schema.user.id, userId)
    })
  } else if (legacyId !== undefined) {
    user = await db.query.user.findFirst({
      where: eq(schema.user.legacyId, legacyId)
    })
  }

  if (!user) throw createError({ statusCode: 401, statusMessage: 'User not found (invalid token)' })

  const userTokens = await db.query.tokens.findMany({
    where: eq(schema.tokens.userId, user.id)
  })

  if (!userTokens.length) throw createError({ statusCode: 401, statusMessage: 'User not found (invalid token)' })

  let foundToken: Token | undefined

  for (const token of userTokens) {
    try {
      const decryptedToken = await unseal(token.token, encryptionKey)
      if (decryptedToken === authToken) foundToken = token
    } catch {
      // Ignore tokens that can't be decrypted with the current key.
    }
  }

  if (!foundToken) throw createError({ statusCode: 401, statusMessage: 'Invalid token' })

  await db.update(schema.tokens)
    .set({
      updatedAt: new Date()
    })
    .where(eq(schema.tokens.id, foundToken.id))

  return user
}
