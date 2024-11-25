import type { CreateUserInput, User } from '@shelve/types'
import { AuthType, Role } from '@shelve/types'
import { TeamService } from '~~/server/services/teams.service'

export async function createUser(input: CreateUserInput): Promise<User> {
  const adminEmails = useRuntimeConfig().private.adminEmails?.split(',') || []
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
  if (!createdUser) throw createError({ statusCode: 500, message: 'Failed to create user' })
  await new TeamService().createTeam({
    name: `${input.username}'s team`,
    private: true,
    requester: {
      id: createdUser.id,
      role: Role.USER,
    }
  })
  return createdUser
}

export async function handleOAuthUser(input: CreateUserInput): Promise<User> {
  const [foundUser] = await useDrizzle()
    .select()
    .from(tables.users)
    .where(eq(tables.users.username, input.username))

  if (!foundUser) return await createUser(input)
  return foundUser
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
  if (usernameTaken) throw createError({ statusCode: 400, message: 'Username already taken' })
  return username
}

function generateUniqueUsername(username: string): string {
  return `${username}_#${Math.floor(Math.random() * 1000)}`
}
