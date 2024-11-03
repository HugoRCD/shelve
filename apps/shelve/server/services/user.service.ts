import type { publicUser, User, CreateUserInput, UpdateUserInput } from '@shelve/types'
import { EmailService } from '~~/server/services/resend.service'

export class UserService {

  private readonly storage: Storage

  constructor() {
    this.storage = useStorage('redis')
  }

  /**
   * Creates or updates a user
   */
  async upsertUser(createUserInput: CreateUserInput): Promise<publicUser> {
    const foundUser = await prisma.user.findUnique({
      where: {
        username: createUserInput.username,
      },
    })

    const newUsername = this.generateUniqueUsername(createUserInput.username, foundUser)

    const user = await prisma.user.upsert({
      where: {
        email: createUserInput.email,
      },
      update: {
        updatedAt: new Date(),
      },
      create: {
        ...createUserInput,
        username: newUsername,
      }
    }) as User
    if (user.createdAt === user.updatedAt) {
      const emailService = new EmailService()
      await emailService.sendWelcomeEmail(user.email, user.username)
    }

    return this.formatUser(user)
  }

  /**
   * Deletes a user by ID
   */
  async deleteUser(userId: number): Promise<void> {
    await prisma.user.delete({
      where: { id: userId },
    })
  }

  /**
   * Updates a user's information
   */
  async updateUser(user: User, updateUserInput: UpdateUserInput, authToken: string): Promise<publicUser> {
    const newUsername = updateUserInput.username

    if (newUsername && newUsername !== user.username) {
      await this.validateUsername(newUsername)
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateUserInput,
    })

    await this.removeCachedUserToken(authToken)
    return this.formatUser(updatedUser)
  }

  /**
   * Removes a cached user token
   */
  private async removeCachedUserToken(authToken: string): Promise<void> {
    const cacheKey = this.generateCacheKey(authToken)
    await this.storage.removeItem(cacheKey)
  }

  /**
   * Generates a unique username if the original is taken
   */
  private generateUniqueUsername(username: string, existingUser: User | null): string {
    if (!existingUser) return username
    return `${username}_#${Math.floor(Math.random() * 1000)}`
  }

  /**
   * Validates if a username is available
   */
  private async validateUsername(username: string): Promise<void> {
    const usernameTaken = await prisma.user.findFirst({
      where: { username },
    })

    if (usernameTaken) {
      throw createError({
        statusCode: 400,
        message: 'Username already taken'
      })
    }
  }

  /**
   * Generates a cache key for user tokens
   */
  private generateCacheKey(authToken: string): string {
    return `nitro:functions:getUserByAuthToken:authToken:${authToken}.json`
  }

  /**
   * Formats a user object for public consumption
   */
  private formatUser(user: User): publicUser {
    // Implement your user formatting logic here
    return user as publicUser
  }

}
