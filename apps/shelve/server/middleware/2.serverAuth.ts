import type { Token, User } from '@types'
import type { H3Event } from 'h3'

export default defineEventHandler(async (event) => {
  const protectedRoutes = [
    '/api/user',
    '/api/teams',
    '/api/environments',
    '/api/tokens',
    '/api/admin',
    '/api/protected',
  ]

  if (!protectedRoutes.some((route) => event.path?.startsWith(route))) return

  const authToken = getCookie(event, 'authToken')

  if (authToken) {
    const user = await getUserByAuthToken(authToken, event)
    await setUserSession(event, {
      user,
      loggedInAt: new Date(),
    })
  }
})

async function getUserByAuthToken(authToken: string, event: H3Event): Promise<User> {
  const { encryptionKey } = useRuntimeConfig(event).private
  const userId = +authToken.split('_')[1] // Extract the user ID from the token
  const userTokens = await useDrizzle().query.tokens.findMany({
    where: eq(tables.tokens.userId, userId)
  })
  if (!userTokens.length) throw createError({ statusCode: 401, statusMessage: 'User not found (invalid token)' })

  let foundToken: Token | undefined

  for (const token of userTokens) {
    const decryptedToken = await unseal(token.token, encryptionKey)
    if (decryptedToken === authToken) foundToken = token
  }

  if (!foundToken) throw createError({ statusCode: 401, statusMessage: 'Invalid token' })

  const user = await useDrizzle().query.users.findFirst({
    where: eq(tables.users.id, userId)
  })
  if (!user) throw createError({ statusCode: 400, statusMessage: 'User not found (invalid token)' })

  await useDrizzle().update(tables.tokens)
    .set({
      updatedAt: new Date()
    })
    .where(eq(tables.tokens.id, foundToken.id))
  return user
}
