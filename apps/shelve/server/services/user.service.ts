import type { publicUser, User, CreateUserInput, UpdateUserInput } from '@shelve/types'
import { PrismaClient } from '@prisma/client'

export class UserService {

  private readonly prisma: PrismaClient
  private readonly storage: Storage

  constructor() {
    this.prisma = usePrisma()
    this.storage = useStorage('redis')
  }

  /**
   * Creates or updates a user
   */
  async upsertUser(createUserInput: CreateUserInput): Promise<publicUser> {
    const foundUser = await this.prisma.user.findUnique({
      where: {
        username: createUserInput.username,
      },
    })

    const newUsername = this.generateUniqueUsername(createUserInput.username, foundUser)

    const user = await this.prisma.user.upsert({
      where: {
        email: createUserInput.email,
      },
      update: {
        updatedAt: new Date(),
      },
      create: {
        ...createUserInput,
        username: newUsername,
      },
    })

    return this.formatUser(user)
  }

  /**
   * Retrieves a user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    })
  }

  /**
   * Deletes a user by ID
   */
  async deleteUser(userId: number): Promise<void> {
    await this.prisma.user.delete({
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

    const updatedUser = await this.prisma.user.update({
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
    const usernameTaken = await this.prisma.user.findFirst({
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
