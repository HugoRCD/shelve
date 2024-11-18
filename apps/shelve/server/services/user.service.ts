import type { CreateUserInput, UpdateUserInput, User } from '@shelve/types'
import { AuthType, Role } from '@shelve/types'
import { TeamService } from '~~/server/services/teams.service'

export class UserService {

  async createUser(input: CreateUserInput): Promise<User> {
    const adminEmails = useRuntimeConfig().private.adminEmails?.split(',') || []
    input.username = await this.validateUsername(input.username, input.authType)
    const [createdUser] = await db
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

  async updateUser(currentUser: User, updateUserInput: UpdateUserInput): Promise<User> {
    if (updateUserInput.username)
      updateUserInput.username = await this.validateUsername(updateUserInput.username, updateUserInput.authType)
    const [updatedRows] = await db
      .update(tables.users)
      .set({
        username: updateUserInput.username,
        avatar: updateUserInput.avatar,
      })
      .where(eq(tables.users.id, currentUser.id))
      .returning()
    if (!updatedRows) throw createError({ statusCode: 404, message: 'User not found' })
    return updatedRows
  }

  async deleteUserById(userId: number): Promise<void> {
    await db.delete(tables.users).where(eq(tables.users.id, userId))
  }

  async handleOAuthUser(input: CreateUserInput): Promise<User> {
    const [foundUser] = await db
      .select()
      .from(tables.users)
      .where(eq(tables.users.username, input.username))

    if (!foundUser) return this.createUser(input)
    console.log('foundUser', foundUser)
    return foundUser
  }

  /**
   * Generates a unique username if the original is taken (for OAuth users)
   */
  private generateUniqueUsername(username: string): string {
    return `${username}_#${Math.floor(Math.random() * 1000)}`
  }

  /**
   * Validates if a username is available
   */
  private async validateUsername(username: string, authType: AuthType): Promise<string> {
    const foundUser = await db
      .select({
        username: tables.users.username,
      })
      .from(tables.users)
      .where(eq(tables.users.username, username))

    const usernameTaken = foundUser.length > 0
    const isOAuthUser = authType === AuthType.GITHUB || authType === AuthType.GOOGLE
    if (isOAuthUser && usernameTaken) return this.generateUniqueUsername(username)
    if (usernameTaken) throw createError({ statusCode: 400, message: 'Username already taken' })
    return username
  }

}
