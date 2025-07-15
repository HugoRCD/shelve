import type { H3Event } from 'h3'
import type { CreateUserInput, Token, User } from '@types'
import { AuthType, Role } from '@types'

export async function createUser(input: CreateUserInput, event: H3Event): Promise<User> {
  const adminEmails = useRuntimeConfig(event).private.adminEmails?.split(',') || []
  input.username = await validateUsername(input.username, input.authType)
  const [createdUser] = await useDrizzle()
    .insert(tables.users)
    .values({
      username: input.username,
      email: input.email,
      avatar: input.avatar,
      authType: input.authType,
      role: adminEmails.includes(input.email) ? Role.ADMIN : undefined,
    })
    .returning()
  if (!createdUser) throw createError({ statusCode: 422, statusMessage: 'Failed to create user' })
  await new EmailService(event).sendWelcomeEmail(input.email, input.username, input.appUrl)
  return createdUser
}

export async function handleOAuthUser(input: CreateUserInput, event: H3Event): Promise<User> {
  const [foundUser] = await useDrizzle()
    .select()
    .from(tables.users)
    .where(eq(tables.users.email, input.email))

  if (!foundUser) return await createUser(input, event)
  return foundUser
}

export async function handleEmailUser(email: string, event: H3Event): Promise<{ user: User; isNewUser: boolean }> {
  const [foundUser] = await useDrizzle()
    .select()
    .from(tables.users)
    .where(eq(tables.users.email, email))

  if (foundUser) {
    return { user: foundUser, isNewUser: false }
  }

  const username = await validateUsername(email.split('@')[0], AuthType.EMAIL)
  const userInput: CreateUserInput = {
    email,
    username,
    authType: AuthType.EMAIL,
    avatar: 'https://i.imgur.com/6VBx3io.png',
    appUrl: getRequestHost(event),
  }

  const newUser = await createUser(userInput, event)
  return { user: newUser, isNewUser: true }
}

export async function validateUsername(username: string, authType?: AuthType): Promise<string> {
  const foundUser = await useDrizzle()
    .select({
      username: tables.users.username,
    })
    .from(tables.users)
    .where(eq(tables.users.username, username))

  const usernameTaken = foundUser.length > 0
  const isOAuthUser = authType === AuthType.GITHUB || authType === AuthType.GOOGLE
  if (isOAuthUser && usernameTaken) return generateUniqueUsername(username)
  if (usernameTaken) throw createError({ statusCode: 400, statusMessage: 'Username already taken' })
  return username
}

function generateUniqueUsername(username: string): string {
  return `${username}_#${Math.floor(Math.random() * 1000)}`
}

export async function getUserByAuthToken(authToken: string, event: H3Event): Promise<User> {
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
