import { seal, unseal } from '@shelve/crypto'
import type { Token, User } from '@shelve/types'

export class TokenService {

  private readonly encryptionKey: string
  private readonly TOKEN_PREFIX = 'she_'
  private readonly TOKEN_LENGTH = 25

  constructor() {
    this.encryptionKey = useRuntimeConfig().private.encryptionKey
  }

  /**
   * Get user by authentication token
   */
  async getUserByAuthToken(authToken: string): Promise<User> {
    const userId = this.extractUserId(authToken)
    const userTokens = await this.getUserTokens(userId)
    const foundToken = await this.findMatchingToken(userTokens, authToken)

    if (!foundToken) {
      throw createError({
        statusCode: 401,
        message: 'Invalid token'
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    })

    await this.updateUsedAt(foundToken.id)
    return user
  }

  /**
   * Get all tokens for a user
   */
  async getTokensByUserId(userId: number): Promise<Token[]> {
    const tokens = await prisma.token.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return Promise.all(tokens.map(async (token) => ({
      ...token,
      token: await unseal(token.token, this.encryptionKey)
    })))
  }

  /**
   * Create a new token for a user
   */
  async createToken({ name, userId }: { name: string; userId: number }): Promise<void> {
    const token = this.generateUserToken(userId)
    const encryptedToken = await seal(token, this.encryptionKey)

    await prisma.token.create({
      data: {
        token: encryptedToken,
        name,
        userId
      },
    })
  }

  /**
   * Update token's last used timestamp
   */
  private async updateUsedAt(tokenId: string): Promise<void> {
    await prisma.token.update({
      where: { id: tokenId },
      data: { updatedAt: new Date() },
    })
  }

  /**
   * Delete a token for a user
   */
  private deleteUserToken(id: string, userId: number): Promise<void> {
    return prisma.token.delete({
      where: {
        id,
        userId,
      },
    })
  }

  /**
   * Generate a new token for a user
   */
  private generateUserToken(userId: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''
    const userIdHash = this.calculateUserIdHash(userId)

    for (let i = 0; i < this.TOKEN_LENGTH; i++) {
      const randomIndex = (Math.floor(Math.random() * characters.length) + userIdHash) % characters.length
      token += characters.charAt(randomIndex)
    }

    return `${this.TOKEN_PREFIX}${userId}_${token}`
  }

  /**
   * Calculate hash from user ID
   */
  private calculateUserIdHash(userId: number): number {
    return Array.from(String(userId)).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  }

  /**
   * Extract user ID from token
   */
  private extractUserId(authToken: string): number {
    return +authToken.split('_')[1]
  }

  /**
   * Get all tokens for a user
   */
  private getUserTokens(userId: number): Promise<Token[]> {
    return prisma.token.findMany({
      where: { userId }
    })
  }

  /**
   * Find matching token from list
   */
  private async findMatchingToken(tokens: Token[], authToken: string): Promise<Token | null> {
    for (const token of tokens) {
      const decryptedToken = await unseal(token.token, this.encryptionKey)
      if (decryptedToken === authToken) {
        return token
      }
    }
    return null
  }

}
