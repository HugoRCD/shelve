import { AuthType, CreateUserInput, UpdateUserInput, User, Role } from '@shelve/types'

export class UserService {

  async createUser(createUserInput: CreateUserInput): Promise<User> {
    const adminEmails = useRuntimeConfig().private.adminEmails?.split(',') || []
    createUserInput.username = await this.validateUsername(createUserInput.username, createUserInput.authType)
    const [createdUser] = await db
      .insert(tables.users)
      .values({
        username: createUserInput.username,
        email: createUserInput.email,
        avatar: createUserInput.avatar,
        authType: createUserInput.authType,
        role: adminEmails.includes(createUserInput.email) ? Role.ADMIN : undefined,
      })
      .returning()
    return createdUser
  }

  async updateUser(currentUser: User, updateUserInput: UpdateUserInput) {
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
    return updatedRows
  }

  async deleteUserById(userId: number): Promise<void> {
    await db.delete(tables.users).where(eq(tables.users.id, userId))
  }

  async handleOAuthUser(createUserInput: CreateUserInput): Promise<User> {
    const [foundUser] = await db
      .select()
      .from(tables.users)
      .where(eq(tables.users.username, createUserInput.username))

    if (!foundUser) return this.createUser(createUserInput)
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
