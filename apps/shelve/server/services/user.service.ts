import type { CreateUserInput, UpdateUserInput, PublicUser } from '@shelve/types'
import { Role } from '@shelve/types'

export class UserService {

  /**
   * Creates or updates a user
   */
  async upsertUser(createUserInput: CreateUserInput): Promise<PublicUser> {
    const foundUser = await prisma.user.findUnique({
      where: {
        username: createUserInput.username,
      },
      select: {
        username: true,
      }
    })

    const username = this.generateUniqueUsername(createUserInput.username, foundUser)

    const config = useRuntimeConfig()
    const adminEmails = config.private.adminEmails?.split(',') || []

    const user = await prisma.user.upsert({
      where: {
        email: createUserInput.email,
      },
      update: {
        updatedAt: new Date(),
      },
      create: {
        ...createUserInput,
        username,
        role: adminEmails.includes(createUserInput.email) ? Role.ADMIN : undefined,
      }
    })

    /*if (user.createdAt === user.updatedAt) {
      const emailService = new EmailService()
      await emailService.sendWelcomeEmail(user.email, user.username)
    }*/

    return user
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
  async updateUser(updateUserInput: UpdateUserInput): Promise<PublicUser> {
    const { currentUser, data } = updateUserInput

    if (data.username && data.username !== currentUser.username) {
      await this.validateUsername(data.username)
    }

    return prisma.user.update({
      where: { id: currentUser.id },
      data,
    })
  }

  /**
   * Generates a unique username if the original is taken
   */
  private generateUniqueUsername(username: string, existingUser: { username: string } | null): string {
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

}
